'use client';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useColorScheme } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';

export default function ModeSwitch() {
  const { mode, setMode } = useColorScheme();
  if (!mode) {
    return null;
  }
  return (
    <Box
      sx={visuallyHidden}
    >
      <FormControl>
        <InputLabel id="mode-select-label">Theme</InputLabel>
        <Select
          labelId="mode-select-label"
          id="mode-select"
          value={mode}
          onChange={(event) => setMode(event.target.value as typeof mode)}
          label="Theme"
        >
          <MenuItem value="system">System</MenuItem>
          <MenuItem value="light">Light</MenuItem>
          <MenuItem value="dark">Dark</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
