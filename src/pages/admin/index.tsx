import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Box, Grid as MuiGrid, Typography, Paper } from "@mui/material";

const Grid = MuiGrid as any;
import {
  ShoppingCart as OrdersIcon,
  AttachMoney as RevenueIcon,
  People as CustomersIcon,
  RateReview as ReviewsIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import StatsCard from "../../components/admin/common/StatsCard";
import LoadingState from "../../components/admin/common/LoadingState";
import SalesChart from "../../components/admin/dashboard/SalesChart";
import OrderStatusChart from "../../components/admin/dashboard/OrderStatusChart";
import TopProductsTable from "../../components/admin/dashboard/TopProductsTable";
import RecentActivity from "../../components/admin/dashboard/RecentActivity";
import AdvancedMetrics from "../../components/admin/dashboard/AdvancedMetrics";
import TimePeriodSelector, { TimePeriod } from "../../components/admin/dashboard/TimePeriodSelector";
import ComparisonView from "../../components/admin/dashboard/ComparisonView";
import { fetcher } from "../../lib/api";
import {
  getDateRangeForPeriod,
  getPreviousPeriodRange,
  filterOrdersByDateRange,
  getPeriodLabel,
  getPreviousPeriodLabel,
} from "../../utils/dateFilters";
import Swal from "sweetalert2";

interface UserInfo {
  sub: string;
  email?: string;
  role?: string;
}

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  pendingReviews: number;
  lowStockProducts: number;
  salesGrowth: number;
}

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    pendingReviews: 0,
    lowStockProducts: 0,
    salesGrowth: 0,
  });
  const [salesData, setSalesData] = useState<any[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<any[]>([]);
  const [topProductsData, setTopProductsData] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [previousPeriodOrders, setPreviousPeriodOrders] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/profile");
          return;
        }

        const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:8000";
        const res = await fetch(`${API_GATEWAY_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const response = await res.json();

        if (!res.ok || !response.success) {
          router.push("/profile");
          return;
        }

        const user = response.data;

        if (user.role !== "admin") {
          Swal.fire({
            icon: "error",
            title: "Access Denied",
            text: "Admins only",
            timer: 2000,
            showConfirmButton: false,
          });
          router.push("/");
          return;
        }

        setUser(user);
        await loadDashboardStats();
      } catch (err) {
        console.error("Error checking admin access:", err);
        router.push("/profile");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [router]);

  // Filter orders based on selected time period
  useEffect(() => {
    if (allOrders.length === 0) return;

    const currentRange = getDateRangeForPeriod(timePeriod);
    const previousRange = getPreviousPeriodRange(timePeriod);

    const currentPeriodOrders = filterOrdersByDateRange(allOrders, currentRange);
    const prevPeriodOrders = filterOrdersByDateRange(allOrders, previousRange);

    setFilteredOrders(currentPeriodOrders);
    setPreviousPeriodOrders(prevPeriodOrders);
  }, [timePeriod, allOrders]);

  const loadDashboardStats = async () => {
    try {
      // Load statistics from various endpoints
      const [catalogsData, reviewsData, ordersData, customersData] = await Promise.all([
        fetcher("/api/catalogs").catch(() => ({ products: [] })),
        fetcher("/api/reviews/admin/all").catch(() => ({ reviews: [] })),
        fetcher("/api/orders/admin/all").catch(() => null),
        fetcher("/api/customers").catch(() => null),
      ]);

      const products = catalogsData.products || catalogsData || [];
      const allReviews = reviewsData.reviews || reviewsData || [];
      const pendingReviews = Array.isArray(allReviews)
        ? allReviews.filter((r: any) => r.status === 'pending')
        : [];

      // Calculate low stock (< 10 items)
      const lowStock = products.filter((p: any) => p.stock < 10).length;

      // Extract and process order data
      let orders: any[] = [];
      let totalOrders = 0;
      let totalRevenue = 0;

      if (ordersData) {
        // Handle nested data structure: ordersData.data.orders or ordersData.orders
        const dataObj = ordersData.data || ordersData;
        orders = dataObj.orders || ordersData.orders || ordersData || [];

        // Store all orders for filtering
        setAllOrders(orders);

        if (Array.isArray(orders)) {
          totalOrders = orders.length;
          totalRevenue = orders.reduce((sum: number, order: any) => {
            const amount = order.total || order.amount || 0;
            return sum + amount;
          }, 0);
        }
      } else {
        console.warn('⚠️ No orders data received from API');
      }

      // Extract customer count
      let customers: any[] = [];
      let totalCustomers = 0;
      if (customersData) {
        // Handle nested data structure: customersData.data.customers or customersData.customers
        const customerDataObj = customersData.data || customersData;
        customers = customerDataObj.customers || customerDataObj.users || customersData.customers || customersData || [];
        totalCustomers = Array.isArray(customers) ? customers.length : 0;

        // Store all customers
        setAllCustomers(customers);
      }

      // Calculate sales growth (current month vs previous month)
      const salesGrowth = calculateSalesGrowth(orders);

      // Update basic stats
      setStats({
        totalOrders,
        totalRevenue,
        totalCustomers,
        pendingReviews: pendingReviews.length,
        lowStockProducts: lowStock,
        salesGrowth,
      });

      // Process analytics data
      if (Array.isArray(orders) && orders.length > 0) {

        // 1. Sales Chart Data - Group orders by date for last 30 days
        const salesChartData = generateSalesChartData(orders);
        setSalesData(salesChartData);

        // 2. Order Status Distribution
        const statusDistribution = generateOrderStatusData(orders);
        setOrderStatusData(statusDistribution);

        // 3. Top Products - Aggregate from order items
        const topProducts = generateTopProductsData(orders, products);
        setTopProductsData(topProducts);

        // 4. Recent Activity
        const activities = generateRecentActivities(orders, allReviews, customers);
        setRecentActivities(activities);
      } else {
        console.warn('⚠️ No orders to process for analytics. Orders:', orders);
      }
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
    }
  };

  // Calculate sales growth (current month vs previous month)
  const calculateSalesGrowth = (orders: any[]) => {
    if (!Array.isArray(orders) || orders.length === 0) return 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate current month revenue
    const currentMonthRevenue = orders
      .filter((order: any) => {
        const orderDate = new Date(order.createdAt || order.orderDate);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      })
      .reduce((sum: number, order: any) => sum + (order.total || order.amount || 0), 0);

    // Calculate previous month revenue
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const prevMonthRevenue = orders
      .filter((order: any) => {
        const orderDate = new Date(order.createdAt || order.orderDate);
        return orderDate.getMonth() === prevMonth && orderDate.getFullYear() === prevYear;
      })
      .reduce((sum: number, order: any) => sum + (order.total || order.amount || 0), 0);

    // Calculate growth percentage
    if (prevMonthRevenue === 0) {
      return currentMonthRevenue > 0 ? 100 : 0;
    }

    const growth = ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100;
    return Math.round(growth * 10) / 10; // Round to 1 decimal place
  };

  // Generate sales chart data from orders
  const generateSalesChartData = (orders: any[]) => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        fullDate: date.toDateString(),
        revenue: 0,
        orders: 0,
      };
    });

    orders.forEach((order: any) => {
      const orderDate = new Date(order.createdAt || order.orderDate).toDateString();
      const dayData = last30Days.find(d => d.fullDate === orderDate);
      if (dayData) {
        dayData.revenue += order.total || order.amount || 0;
        dayData.orders += 1;
      }
    });

    return last30Days.map(({ date, revenue, orders }) => ({ date, revenue, orders }));
  };

  // Generate order status distribution
  const generateOrderStatusData = (orders: any[]) => {
    const statusColors: any = {
      pending: '#ff9800',
      processing: '#2196f3',
      shipped: '#9c27b0',
      delivered: '#4caf50',
      cancelled: '#f44336',
    };

    const statusCounts: any = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    orders.forEach((order: any) => {
      const status = (order.status || 'pending').toLowerCase();
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      }
    });

    return Object.entries(statusCounts)
      .filter(([_, count]: [string, number]) => count > 0)
      .map(([status, count]: [string, number]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
        color: statusColors[status],
      }));
  };

  // Generate top products data
  const generateTopProductsData = (orders: any[], products: any[]) => {
    const productSales: any = {};
    orders.forEach((order: any) => {
      const items = order.items || [];
      items.forEach((item: any) => {
        const productId = item.productId || item.product?._id || item.product;
        if (productId) {
          if (!productSales[productId]) {
            productSales[productId] = {
              salesCount: 0,
              revenue: 0,
              title: item.title || item.product?.title || 'Unknown Product',
              image: item.URL || item.product?.URL || '',
            };
          }
          productSales[productId].salesCount += item.quantity || 1;
          productSales[productId].revenue += (item.price || 0) * (item.quantity || 1);
        }
      });
    });

    return Object.entries(productSales)
      .map(([id, data]: [string, any]) => ({
        _id: id,
        title: data.title,
        image: data.image,
        salesCount: data.salesCount,
        revenue: data.revenue,
        stock: products.find((p: any) => p._id === id)?.stock || 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  // Generate recent activities
  const generateRecentActivities = (orders: any[], reviews: any[], customers: any[]) => {
    const activities: any[] = [];

    // Recent orders
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt || b.orderDate).getTime() - new Date(a.createdAt || a.orderDate).getTime())
      .slice(0, 3);

    recentOrders.forEach((order: any) => {
      activities.push({
        id: `order-${order._id}`,
        type: 'order',
        title: `Order #${order._id?.slice(-6)}`,
        description: `₹${(order.total || order.amount || 0).toLocaleString('en-IN')}`,
        timestamp: getTimeAgo(order.createdAt || order.orderDate),
        status: order.status === 'delivered' ? 'success' : 'info',
      });
    });

    // Recent reviews
    const recentReviews = reviews
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 2);

    recentReviews.forEach((review: any) => {
      activities.push({
        id: `review-${review._id}`,
        type: 'review',
        title: `${review.rating}-star review`,
        description: review.comment?.substring(0, 50) || 'New review received',
        timestamp: getTimeAgo(review.createdAt),
        status: 'warning',
      });
    });

    // Sort all activities by timestamp
    return activities.sort((a, b) => {
      // This is a simple sort, you may want to improve this
      return 0;
    }).slice(0, 5);
  };

  // Helper function to get time ago
  const getTimeAgo = (date: string | Date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return past.toLocaleDateString('en-IN');
  };

  if (loading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Welcome back, {user?.email || "Admin"}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your store today
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<OrdersIcon />}
            color="primary"
            onClick={() => router.push("/admin/orders")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            icon={<RevenueIcon />}
            color="success"
            trend={{ value: Math.abs(stats.salesGrowth), isPositive: stats.salesGrowth >= 0 }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            title="Total Customers"
            value={stats.totalCustomers}
            icon={<CustomersIcon />}
            color="info"
            onClick={() => router.push("/admin/customers")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            title="Pending Reviews"
            value={stats.pendingReviews}
            icon={<ReviewsIcon />}
            color="warning"
            onClick={() => router.push("/admin/reviews")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            title="Low Stock Items"
            value={stats.lowStockProducts}
            icon={<InventoryIcon />}
            color="error"
            onClick={() => router.push("/admin/catalogs")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            title="Sales Growth"
            value={`${stats.salesGrowth > 0 ? '+' : ''}${stats.salesGrowth}%`}
            icon={<TrendingUpIcon />}
            color="secondary"
            trend={{ value: Math.abs(stats.salesGrowth), isPositive: stats.salesGrowth >= 0 }}
          />
        </Grid>
      </Grid>

      {/* Analytics Section Header */}
      <Box sx={{ mb: 3, mt: 2 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Advanced Analytics Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track your sales performance and order trends with detailed insights
        </Typography>
      </Box>

      {/* Time Period Selector */}
      <TimePeriodSelector value={timePeriod} onChange={setTimePeriod} />

      {/* Advanced Metrics Cards */}
      <Box sx={{ mb: 4 }}>
        <AdvancedMetrics
          orders={filteredOrders}
          customers={allCustomers}
          previousPeriodOrders={previousPeriodOrders}
        />
      </Box>

      {/* Comparison View */}
      <Box sx={{ mb: 4 }}>
        <ComparisonView
          currentPeriodLabel={getPeriodLabel(timePeriod)}
          previousPeriodLabel={getPreviousPeriodLabel(timePeriod)}
          metrics={[
            {
              label: 'Total Revenue',
              currentValue: filteredOrders.reduce((sum, o) => sum + (o.amount || o.total || 0), 0),
              previousValue: previousPeriodOrders.reduce((sum, o) => sum + (o.amount || o.total || 0), 0),
              format: 'currency',
            },
            {
              label: 'Total Orders',
              currentValue: filteredOrders.length,
              previousValue: previousPeriodOrders.length,
              format: 'number',
            },
            {
              label: 'Average Order Value',
              currentValue: filteredOrders.length > 0 ? filteredOrders.reduce((sum, o) => sum + (o.amount || o.total || 0), 0) / filteredOrders.length : 0,
              previousValue: previousPeriodOrders.length > 0 ? previousPeriodOrders.reduce((sum, o) => sum + (o.amount || o.total || 0), 0) / previousPeriodOrders.length : 0,
              format: 'currency',
            },
            {
              label: 'Delivered Orders',
              currentValue: filteredOrders.filter(o => o.status === 'delivered').length,
              previousValue: previousPeriodOrders.filter(o => o.status === 'delivered').length,
              format: 'number',
            },
            {
              label: 'Cancelled Orders',
              currentValue: filteredOrders.filter(o => o.status === 'cancelled').length,
              previousValue: previousPeriodOrders.filter(o => o.status === 'cancelled').length,
              format: 'number',
            },
            {
              label: 'Pending Orders',
              currentValue: filteredOrders.filter(o => o.status === 'pending').length,
              previousValue: previousPeriodOrders.filter(o => o.status === 'pending').length,
              format: 'number',
            },
          ]}
        />
      </Box>

      {/* Analytics Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={12} lg={12}>
          <Box sx={{ height: { xs: 500, sm: 600, md: 650, lg: 700 } }}>
            <SalesChart data={salesData} />
          </Box>
        </Grid>
        <Grid item xs={12} md={12} lg={12}>
          <Box sx={{ height: { xs: 450, sm: 500, md: 550 } }}>
            <OrderStatusChart data={orderStatusData} />
          </Box>
        </Grid>
      </Grid>

      {/* Insights Section Header */}
      <Box sx={{ mb: 3, mt: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Store Insights
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Top performing products and recent activity
        </Typography>
      </Box>

      {/* Products & Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <TopProductsTable products={topProductsData} />
        </Grid>
        <Grid item xs={12} lg={5}>
          <RecentActivity activities={recentActivities} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
