import React from 'react'
import {
  OutlinedInput,
  InputAdornment,
  FormControl,
  FormLabel,
  FormHelperText,
} from '@mui/material'

// Define the props the component will accept
interface MoneyInputProps {
  name: string
  label?: string
  value?: string // The raw numeric string value (e.g., "100000")
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void // The parent's state setter
  helperText?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
}

/**
 * A reusable input component that automatically formats numeric input
 * as currency (e.g., "100,000") for display, while ensuring the
 * actual state value remains a clean string of numbers.
 */
const MoneyInput: React.FC<MoneyInputProps> = ({
  name,
  label,
  value,
  onChange,
  helperText,
  required,
  disabled = false,
  placeholder = '',
}) => {
  // This function formats the raw numeric string into a comma-separated string
  const formatCurrency = (val?: string): string => {
    if (!val || val === undefined) return ''
    const num = parseInt(val, 10)
    if (isNaN(num)) return ''
    return num.toLocaleString('ko-KR') // Use Korean locale for comma formatting
  }

  // This handler is called every time the user types in the input
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Get the raw value from the input (e.g., "100,000a")
    const rawValue = event.target.value

    // 2. Remove all non-digit characters to get a clean number string (e.g., "100000")
    const numericValue = rawValue.replace(/[^0-9]/g, '')

    // 3. Create a synthetic event to pass the cleaned value back to the parent form handler
    const newEvent = {
      ...event,
      target: {
        ...event.target,
        name: name,
        value: numericValue,
      },
    }

    // 4. Call the parent's onChange handler (e.g., handleFormChange) with the cleaned data
    onChange(newEvent as React.ChangeEvent<HTMLInputElement>)
  }

  return (
    <>
      <OutlinedInput
        id={name}
        name={name}
        type='text' // Use type="text" to allow formatting characters like commas
        value={formatCurrency(value)} // Display the formatted value to the user
        onChange={handleInputChange} // Use our custom handler to process input
        endAdornment={<InputAdornment position='end'>원</InputAdornment>}
        disabled={disabled}
        placeholder={formatCurrency(placeholder)}
      />
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </>
  )
}

export default MoneyInput
