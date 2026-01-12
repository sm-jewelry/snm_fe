import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Box,
  IconButton,
  Collapse,
  Typography,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  BugReport as DebugIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

export interface LogEntry {
  id: string;
  level: 'error' | 'warning' | 'info' | 'debug';
  message: string;
  timestamp: string;
  service: string;
  details?: string;
}

interface LogsTableProps {
  logs: LogEntry[];
}

const LogRow: React.FC<{ log: LogEntry }> = ({ log }) => {
  const [open, setOpen] = useState(false);

  const getIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <ErrorIcon sx={{ color: 'error.main', fontSize: 20 }} />;
      case 'warning':
        return <WarningIcon sx={{ color: 'warning.main', fontSize: 20 }} />;
      case 'info':
        return <InfoIcon sx={{ color: 'info.main', fontSize: 20 }} />;
      case 'debug':
        return <DebugIcon sx={{ color: 'text.secondary', fontSize: 20 }} />;
      default:
        return <InfoIcon sx={{ fontSize: 20 }} />;
    }
  };

  const getColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case 'debug':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss');
    } catch {
      return timestamp;
    }
  };

  return (
    <>
      <TableRow
        sx={{
          '&:hover': { backgroundColor: 'action.hover' },
          cursor: log.details ? 'pointer' : 'default',
        }}
        onClick={() => log.details && setOpen(!open)}
      >
        <TableCell sx={{ width: 50 }}>
          {log.details && (
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          )}
        </TableCell>
        <TableCell sx={{ width: 100 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getIcon(log.level)}
            <Chip
              label={log.level.toUpperCase()}
              size="small"
              color={getColor(log.level) as any}
              sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
            />
          </Box>
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight={500}>
            {log.message}
          </Typography>
        </TableCell>
        <TableCell sx={{ width: 180 }}>
          <Chip
            label={log.service}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
        </TableCell>
        <TableCell sx={{ width: 200 }}>
          <Typography variant="body2" color="text.secondary">
            {formatTimestamp(log.timestamp)}
          </Typography>
        </TableCell>
      </TableRow>
      {log.details && (
        <TableRow>
          <TableCell colSpan={5} sx={{ py: 0, borderBottom: open ? undefined : 0 }}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ p: 2, backgroundColor: 'action.hover' }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Details:
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                  {log.details}
                </Typography>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

const LogsTable: React.FC<LogsTableProps> = ({ logs }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedLogs = logs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 50 }} />
              <TableCell sx={{ width: 100 }}>Level</TableCell>
              <TableCell>Message</TableCell>
              <TableCell sx={{ width: 180 }}>Service</TableCell>
              <TableCell sx={{ width: 200 }}>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No logs found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedLogs.map((log) => <LogRow key={log.id} log={log} />)
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        component="div"
        count={logs.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default LogsTable;
