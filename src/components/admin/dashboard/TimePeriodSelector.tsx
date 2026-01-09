import React from 'react';
import { Box, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
  Today,
  DateRange,
  CalendarMonth,
  CalendarToday,
} from '@mui/icons-material';

export type TimePeriod = 'today' | 'week' | 'month' | 'year' | 'all';

interface TimePeriodSelectorProps {
  value: TimePeriod;
  onChange: (period: TimePeriod) => void;
}

const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({ value, onChange }) => {
  const theme = useTheme();

  const handleChange = (event: React.MouseEvent<HTMLElement>, newPeriod: TimePeriod | null) => {
    if (newPeriod !== null) {
      onChange(newPeriod);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        mb: 4,
      }}
    >
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={handleChange}
        sx={{
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          borderRadius: 3,
          padding: 0.5,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          '& .MuiToggleButton-root': {
            border: 'none',
            borderRadius: 2.5,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            },
            '&.Mui-selected': {
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            },
          },
        }}
      >
        <ToggleButton value="today">
          <Today sx={{ mr: 1, fontSize: '1.2rem' }} />
          Today
        </ToggleButton>
        <ToggleButton value="week">
          <DateRange sx={{ mr: 1, fontSize: '1.2rem' }} />
          This Week
        </ToggleButton>
        <ToggleButton value="month">
          <CalendarMonth sx={{ mr: 1, fontSize: '1.2rem' }} />
          This Month
        </ToggleButton>
        <ToggleButton value="year">
          <CalendarToday sx={{ mr: 1, fontSize: '1.2rem' }} />
          This Year
        </ToggleButton>
        <ToggleButton value="all">
          All Time
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default TimePeriodSelector;
