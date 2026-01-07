import React from 'react';
import {
  DataGrid,
  GridColDef,
  GridRowsProp,
  GridToolbar,
  GridSortModel,
  GridFilterModel,
  GridPaginationModel,
} from '@mui/x-data-grid';
import { Box, Paper } from '@mui/material';

interface DataTableProps {
  columns: GridColDef[];
  rows: GridRowsProp;
  loading?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  onRowClick?: (params: any) => void;
  checkboxSelection?: boolean;
  disableRowSelectionOnClick?: boolean;
  autoHeight?: boolean;
  hideFooter?: boolean;
  toolbar?: boolean;
  onSortModelChange?: (model: GridSortModel) => void;
  onFilterModelChange?: (model: GridFilterModel) => void;
  onPaginationModelChange?: (model: GridPaginationModel) => void;
  rowCount?: number;
  paginationMode?: 'client' | 'server';
  sortingMode?: 'client' | 'server';
  filterMode?: 'client' | 'server';
}

/**
 * DataTable Component
 * Reusable wrapper around MUI DataGrid with standard configuration
 * Provides consistent styling and behavior across all admin tables
 */
const DataTable: React.FC<DataTableProps> = ({
  columns,
  rows,
  loading = false,
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
  onRowClick,
  checkboxSelection = false,
  disableRowSelectionOnClick = true,
  autoHeight = false,
  hideFooter = false,
  toolbar = true,
  onSortModelChange,
  onFilterModelChange,
  onPaginationModelChange,
  rowCount,
  paginationMode = 'client',
  sortingMode = 'client',
  filterMode = 'client',
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: {
              paginationModel: { pageSize, page: 0 },
            },
          }}
          pageSizeOptions={pageSizeOptions}
          onRowClick={onRowClick}
          checkboxSelection={checkboxSelection}
          disableRowSelectionOnClick={disableRowSelectionOnClick}
          autoHeight={autoHeight}
          hideFooter={hideFooter}
          slots={toolbar ? { toolbar: GridToolbar } : undefined}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          onSortModelChange={onSortModelChange}
          onFilterModelChange={onFilterModelChange}
          onPaginationModelChange={onPaginationModelChange}
          rowCount={rowCount}
          paginationMode={paginationMode}
          sortingMode={sortingMode}
          filterMode={filterMode}
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'action.hover',
              fontSize: '0.875rem',
              fontWeight: 600,
            },
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row': {
              cursor: onRowClick ? 'pointer' : 'default',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover',
            },
            '& .MuiDataGrid-cell': {
              fontSize: '0.875rem',
            },
          }}
        />
      </Box>
    </Paper>
  );
};

export default DataTable;
