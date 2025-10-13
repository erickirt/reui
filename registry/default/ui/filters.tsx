'use client';

import type React from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/registry/default/ui/command';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/registry/default/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/registry/default/ui/popover';
import { Switch } from '@/registry/default/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/registry/default/ui/tooltip';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, Check, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// i18n Configuration Interface
export interface FilterI18nConfig {
  // UI Labels
  addFilter: string;
  searchFields: string;
  noFieldsFound: string;
  noResultsFound: string;
  select: string;
  true: string;
  false: string;
  min: string;
  max: string;
  to: string;
  typeAndPressEnter: string;
  selected: string;
  selectedCount: string;
  percent: string;
  defaultCurrency: string;
  defaultColor: string;
  addFilterTitle: string;

  // Operators
  operators: {
    is: string;
    isNot: string;
    isAnyOf: string;
    isNotAnyOf: string;
    includesAll: string;
    excludesAll: string;
    before: string;
    after: string;
    between: string;
    notBetween: string;
    contains: string;
    notContains: string;
    startsWith: string;
    endsWith: string;
    isExactly: string;
    equals: string;
    notEquals: string;
    greaterThan: string;
    lessThan: string;
    overlaps: string;
    includes: string;
    excludes: string;
    includesAllOf: string;
    includesAnyOf: string;
    empty: string;
    notEmpty: string;
  };

  // Placeholders
  placeholders: {
    enterField: (fieldType: string) => string;
    selectField: string;
    searchField: (fieldName: string) => string;
    enterKey: string;
    enterValue: string;
  };

  // Helper functions
  helpers: {
    formatOperator: (operator: string) => string;
  };

  // Validation
  validation: {
    invalidEmail: string;
    invalidUrl: string;
    invalidTel: string;
    invalid: string;
  };
}

// Default English i18n configuration
export const DEFAULT_I18N: FilterI18nConfig = {
  // UI Labels
  addFilter: 'Add filter',
  searchFields: 'Search fields...',
  noFieldsFound: 'No fields found.',
  noResultsFound: 'No results found.',
  select: 'Select...',
  true: 'True',
  false: 'False',
  min: 'Min',
  max: 'Max',
  to: 'to',
  typeAndPressEnter: 'Type and press Enter to add tag',
  selected: 'selected',
  selectedCount: 'selected',
  percent: '%',
  defaultCurrency: '$',
  defaultColor: '#000000',
  addFilterTitle: 'Add filter',

  // Operators
  operators: {
    is: 'is',
    isNot: 'is not',
    isAnyOf: 'is any of',
    isNotAnyOf: 'is not any of',
    includesAll: 'includes all',
    excludesAll: 'excludes all',
    before: 'before',
    after: 'after',
    between: 'between',
    notBetween: 'not between',
    contains: 'contains',
    notContains: 'does not contain',
    startsWith: 'starts with',
    endsWith: 'ends with',
    isExactly: 'is exactly',
    equals: 'equals',
    notEquals: 'not equals',
    greaterThan: 'greater than',
    lessThan: 'less than',
    overlaps: 'overlaps',
    includes: 'includes',
    excludes: 'excludes',
    includesAllOf: 'includes all of',
    includesAnyOf: 'includes any of',
    empty: 'is empty',
    notEmpty: 'is not empty',
  },

  // Placeholders
  placeholders: {
    enterField: (fieldType: string) => `Enter ${fieldType}...`,
    selectField: 'Select...',
    searchField: (fieldName: string) => `Search ${fieldName.toLowerCase()}...`,
    enterKey: 'Enter key...',
    enterValue: 'Enter value...',
  },

  // Helper functions
  helpers: {
    formatOperator: (operator: string) => operator.replace(/_/g, ' '),
  },

  // Validation
  validation: {
    invalidEmail: 'Invalid email format',
    invalidUrl: 'Invalid URL format',
    invalidTel: 'Invalid phone format',
    invalid: 'Invalid input format',
  },
};

// Context for all Filter component props
interface FilterContextValue {
  variant: 'solid' | 'outline';
  size: 'sm' | 'md' | 'lg';
  radius: 'md' | 'full';
  i18n: FilterI18nConfig;
  cursorPointer: boolean;
  className?: string;
  showAddButton?: boolean;
  addButtonText?: string;
  addButtonIcon?: React.ReactNode;
  addButtonClassName?: string;
  addButton?: React.ReactNode;
  showSearchInput?: boolean;
  trigger?: React.ReactNode;
  allowMultiple?: boolean;
}

const FilterContext = createContext<FilterContextValue>({
  variant: 'outline',
  size: 'md',
  radius: 'md',
  i18n: DEFAULT_I18N,
  cursorPointer: true,
  className: undefined,
  showAddButton: true,
  addButtonText: undefined,
  addButtonIcon: undefined,
  addButtonClassName: undefined,
  addButton: undefined,
  showSearchInput: true,
  trigger: undefined,
  allowMultiple: true,
});

const useFilterContext = () => useContext(FilterContext);

// Reusable input variant component for consistent styling
const filterInputVariants = cva(
  [
    'transition shrink-0 outline-none text-foreground relative flex items-center',
    'has-[[data-slot=filters-input]:focus-visible]:ring-ring/30',
    'has-[[data-slot=filters-input]:focus-visible]:border-ring',
    'has-[[data-slot=filters-input]:focus-visible]:outline-none',
    'has-[[data-slot=filters-input]:focus-visible]:ring-[3px]',
    'has-[[data-slot=filters-input]:focus-visible]:z-1',
    'has-[[data-slot=filters-input]:aria-invalid]:border',
    'has-[[data-slot=filters-input]:aria-invalid]:border-solid',
    'has-[[data-slot=filters-input]:aria-invalid]:border-destructive/60',
    'has-[[data-slot=filters-input]:aria-invalid]:ring-destructive/10',
    'dark:has-[[data-slot=filters-input]:aria-invalid]:border-destructive',
    'dark:has-[[data-slot=filters-input]:aria-invalid]:ring-destructive/20',
  ],
  {
    variants: {
      variant: {
        solid: 'border-0 bg-secondary',
        outline: 'bg-background border border-border',
      },
      size: {
        lg: 'h-10 text-sm px-2.5 has-[[data-slot=filters-prefix]]:ps-0 has-[[data-slot=filters-suffix]]:pe-0',
        md: 'h-9 text-sm px-2 has-[[data-slot=filters-prefix]]:ps-0 has-[[data-slot=filters-suffix]]:pe-0',
        sm: 'h-8 text-xs px-1.5 has-[[data-slot=filters-prefix]]:ps-0 has-[[data-slot=filters-suffix]]:pe-0',
      },
      cursorPointer: {
        true: 'cursor-pointer',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'outline',
      size: 'md',
      cursorPointer: true,
    },
  },
);

// Reusable remove button variant component
const filterRemoveButtonVariants = cva(
  ['inline-flex items-center shrink-0 justify-center transition shrink-0 text-muted-foreground hover:text-foreground'],
  {
    variants: {
      variant: {
        solid: 'bg-secondary',
        outline: 'border border-border border-s-0 hover:bg-secondary',
      },
      size: {
        lg: 'h-10 w-10 [&_svg:not([class*=size-])]:size-4',
        md: 'h-9 w-9 [&_svg:not([class*=size-])]:size-3.5',
        sm: 'h-8 w-8 [&_svg:not([class*=size-])]:size-3',
      },
      cursorPointer: {
        true: 'cursor-pointer',
        false: '',
      },
      radius: {
        md: 'rounded-e-md',
        full: 'rounded-e-full',
      },
    },
    defaultVariants: {
      variant: 'outline',
      size: 'md',
      radius: 'md',
      cursorPointer: true,
    },
  },
);

const filterAddButtonVariants = cva(
  [
    'inline-flex items-center shrink-0 justify-center transition shrink-0 text-foreground shadow-xs shadow-black/5',
    '[&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:opacity-60',
  ],
  {
    variants: {
      variant: {
        solid: 'border border-input hover:bg-secondary/60',
        outline: 'border border-border hover:bg-secondary',
      },
      size: {
        lg: 'h-10 px-4 text-sm gap-1.5 [&_svg:not([class*=size-])]:size-4',
        md: 'h-9 px-3 gap-1.5 text-sm [&_svg:not([class*=size-])]:size-4',
        sm: 'h-8 px-2.5 gap-1.25 text-xs [&_svg:not([class*=size-])]:size-3.5',
      },
      radius: {
        md: 'rounded-md',
        full: 'rounded-full',
      },
      cursorPointer: {
        true: 'cursor-pointer',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'outline',
      size: 'md',
      cursorPointer: true,
    },
  },
);

const filterOperatorVariants = cva(
  [
    'transition text-muted-foreground hover:text-foreground data-[state=open]:text-foreground shrink-0 flex items-center relative focus-visible:z-1',
  ],
  {
    variants: {
      variant: {
        solid: 'bg-secondary',
        outline:
          'bg-background border border-border border-e-0 hover:bg-secondary data-[state=open]:bg-secondary [&+[data-slot=filters-remove]]:border-s',
      },
      size: {
        lg: 'h-10 px-4 text-sm gap-1.5',
        md: 'h-9 px-3 text-sm gap-1.25',
        sm: 'h-8 px-2.5 text-xs gap-1',
      },
      cursorPointer: {
        true: 'cursor-pointer',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'outline',
      size: 'md',
      cursorPointer: true,
    },
  },
);

const filterFieldLabelVariants = cva(
  [
    'flex gap-1.5 shrink-0 px-1.5 py-1 items-center text-foreground',
    '[&_svg:not([class*=size-])]:size-3.5 [&_svg:not([class*=opacity-])]:opacity-60',
  ],
  {
    variants: {
      variant: {
        solid: 'bg-secondary',
        outline: 'border border-border border-e-0',
      },
      size: {
        lg: 'h-10 px-4 text-sm gap-1.5 [&_svg:not([class*=size-])]:size-4',
        md: 'h-9 px-3 gap-1.5 text-sm [&_svg:not([class*=size-])]:size-4',
        sm: 'h-8 px-2.5 gap-1.25 text-xs [&_svg:not([class*=size-])]:size-3.5',
      },
      radius: {
        md: 'rounded-s-md',
        full: 'rounded-s-full',
      },
    },
    defaultVariants: {
      variant: 'outline',
      size: 'md',
    },
  },
);

const filterFieldValueVariants = cva(
  'text-foreground transition shrink-0 flex items-center gap-1 relative focus-visible:z-1',
  {
    variants: {
      variant: {
        solid: 'bg-secondary',
        outline: 'bg-background border border-border hover:bg-secondary',
      },
      size: {
        lg: 'h-10 px-4 text-sm gap-1.5 [&_svg:not([class*=size-])]:size-4',
        md: 'h-9 px-3 gap-1.5 text-sm [&_svg:not([class*=size-])]:size-4',
        sm: 'h-8 px-2.5 gap-1.25 text-xs [&_svg:not([class*=size-])]:size-3.5',
      },
      cursorPointer: {
        true: 'cursor-pointer',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'outline',
      size: 'md',
      cursorPointer: true,
    },
  },
);

const filterFieldAddonVariants = cva('text-foreground shrink-0 flex items-center justify-center', {
  variants: {
    variant: {
      solid: '',
      outline: '',
    },
    size: {
      lg: 'h-10 px-4 text-sm',
      md: 'h-9 px-3 text-sm',
      sm: 'h-8 px-2.5 text-xs',
    },
  },
  defaultVariants: {
    variant: 'outline',
    size: 'md',
  },
});

const filterFieldBetweenVariants = cva('text-muted-foreground shrink-0 flex items-center', {
  variants: {
    variant: {
      solid: 'bg-secondary',
      outline: 'bg-background border border-border border-x-0',
    },
    size: {
      lg: 'h-10 px-4 text-sm',
      md: 'h-9 px-3 text-sm',
      sm: 'h-8 px-2.5 text-xs',
    },
  },
  defaultVariants: {
    variant: 'outline',
    size: 'md',
  },
});

const filtersContainerVariants = cva('flex flex-wrap items-center', {
  variants: {
    variant: {
      solid: 'gap-2',
      outline: '',
    },
    size: {
      sm: 'gap-1.5',
      md: 'gap-2.5',
      lg: 'gap-3.5',
    },
  },
  defaultVariants: {
    variant: 'outline',
    size: 'md',
  },
});

const filterItemVariants = cva('flex items-center shadow-xs shadow-black/5', {
  variants: {
    variant: {
      solid: 'gap-px',
      outline: '',
    },
  },
  defaultVariants: {
    variant: 'outline',
  },
});

function FilterInput<T = unknown>({
  field,
  onChange,
  onBlur,
  onKeyDown,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { className?: string; field?: FilterFieldConfig<T> }) {
  const context = useFilterContext();
  const [isValid, setIsValid] = useState(true);
  const [validationMessage, setValidationMessage] = useState('');

  // Validation function to check if input matches pattern
  const validateInput = (value: string, pattern?: string): boolean => {
    if (!pattern || !value) return true;
    const regex = new RegExp(pattern);
    return regex.test(value);
  };

  // Get validation message for field type
  const getValidationMessage = (fieldType: string, hasCustomPattern: boolean = false): string => {
    // If it's a text or number field with a custom pattern, use the generic invalid message
    if ((fieldType === 'text' || fieldType === 'number') && hasCustomPattern) {
      return context.i18n.validation.invalid;
    }

    switch (fieldType) {
      case 'email':
        return context.i18n.validation.invalidEmail;
      case 'url':
        return context.i18n.validation.invalidUrl;
      case 'tel':
        return context.i18n.validation.invalidTel;
      default:
        return context.i18n.validation.invalid;
    }
  };

  // Handle input change - allow typing without validation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Always allow typing, just call the original onChange
    onChange?.(e);
  };

  // Handle blur event - validate when user leaves input
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const pattern = field?.pattern || props.pattern;

    // Only validate if there's a value and pattern
    if (value && pattern) {
      let valid = true;

      // If there's a custom validation function, use it
      if (field?.validation) {
        valid = field.validation(value);
      } else {
        // Use pattern validation
        valid = validateInput(value, pattern);
      }

      setIsValid(valid);
      const hasCustomPattern = !!(field?.pattern || props.pattern);
      setValidationMessage(valid ? '' : getValidationMessage(field?.type || '', hasCustomPattern));
    } else {
      // Reset validation state for empty values or no pattern
      setIsValid(true);
      setValidationMessage('');
    }

    // Call the original onBlur if provided
    onBlur?.(e);
  };

  // Handle keydown event - hide validation error when user starts typing
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Hide validation error when user starts typing (any key except special keys)
    if (!isValid && !['Tab', 'Escape', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      setIsValid(true);
      setValidationMessage('');
    }

    // Call the original onKeyDown if provided
    onKeyDown?.(e);
  };

  return (
    <div
      className={cn('w-36', filterInputVariants({ variant: context.variant, size: context.size }), className)}
      data-slot="filters-input-wrapper"
    >
      {field?.prefix && (
        <div
          data-slot="filters-prefix"
          className={filterFieldAddonVariants({ variant: context.variant, size: context.size })}
        >
          {field.prefix}
        </div>
      )}

      <div className="w-full flex items-stretch">
        <input
          className="w-full outline-none"
          aria-invalid={!isValid}
          aria-describedby={!isValid && validationMessage ? `${field?.key || 'input'}-error` : undefined}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          data-slot="filters-input"
          {...props}
        />
        {!isValid && validationMessage && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                <AlertCircle className="size-3.5 text-destructive" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">{validationMessage}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {field?.suffix && (
        <div
          data-slot="filters-suffix"
          className={cn(filterFieldAddonVariants({ variant: context.variant, size: context.size }))}
        >
          {field.suffix}
        </div>
      )}
    </div>
  );
}

interface FilterRemoveButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof filterRemoveButtonVariants> {
  icon?: React.ReactNode;
}

function FilterRemoveButton({ className, icon = <X />, ...props }: FilterRemoveButtonProps) {
  const context = useFilterContext();

  return (
    <button
      data-slot="filters-remove"
      className={cn(
        filterRemoveButtonVariants({
          variant: context.variant,
          size: context.size,
          cursorPointer: context.cursorPointer,
          radius: context.radius,
        }),
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  );
}

// Generic types for flexible filter system
export interface FilterOption<T = unknown> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  metadata?: Record<string, unknown>;
}

export interface FilterOperator {
  value: string;
  label: string;
  supportsMultiple?: boolean;
}

// Custom renderer props interface
export interface CustomRendererProps<T = unknown> {
  field: FilterFieldConfig<T>;
  values: T[];
  onChange: (values: T[]) => void;
  operator: string;
}

// Grouped field configuration interface
export interface FilterFieldGroup<T = unknown> {
  group?: string;
  fields: FilterFieldConfig<T>[];
}

// Union type for both flat and grouped field configurations
export type FilterFieldsConfig<T = unknown> = FilterFieldConfig<T>[] | FilterFieldGroup<T>[];

export interface FilterFieldConfig<T = unknown> {
  key?: string;
  label?: string;
  icon?: React.ReactNode;
  type?:
    | 'select'
    | 'multiselect'
    | 'date'
    | 'daterange'
    | 'text'
    | 'number'
    | 'numberrange'
    | 'boolean'
    | 'email'
    | 'url'
    | 'tel'
    | 'time'
    | 'datetime'
    | 'custom'
    | 'separator';
  // Group-level configuration
  group?: string;
  fields?: FilterFieldConfig<T>[];
  // Field-specific options
  options?: FilterOption<T>[];
  operators?: FilterOperator[];
  customRenderer?: (props: CustomRendererProps<T>) => React.ReactNode;
  customValueRenderer?: (values: T[], options: FilterOption<T>[]) => React.ReactNode;
  placeholder?: string;
  searchable?: boolean;
  maxSelections?: number;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string | React.ReactNode;
  suffix?: string | React.ReactNode;
  pattern?: string;
  validation?: (value: unknown) => boolean;
  allowCustomValues?: boolean;
  className?: string;
  popoverContentClassName?: string;
  // Grouping options (legacy support)
  groupLabel?: string;
  // Boolean field options
  onLabel?: string;
  offLabel?: string;
}

// Helper functions to handle both flat and grouped field configurations
const isFieldGroup = <T = unknown,>(item: FilterFieldConfig<T> | FilterFieldGroup<T>): item is FilterFieldGroup<T> => {
  return 'fields' in item && Array.isArray(item.fields);
};

// Helper function to check if a FilterFieldConfig is a group-level configuration
const isGroupLevelField = <T = unknown,>(field: FilterFieldConfig<T>): boolean => {
  return Boolean(field.group && field.fields);
};

const flattenFields = <T = unknown,>(fields: FilterFieldsConfig<T>): FilterFieldConfig<T>[] => {
  return fields.reduce<FilterFieldConfig<T>[]>((acc, item) => {
    if (isFieldGroup(item)) {
      return [...acc, ...item.fields];
    }
    // Handle group-level fields (new structure)
    if (isGroupLevelField(item)) {
      return [...acc, ...item.fields!];
    }
    return [...acc, item];
  }, []);
};

const getFieldsMap = <T = unknown,>(fields: FilterFieldsConfig<T>): Record<string, FilterFieldConfig<T>> => {
  const flatFields = flattenFields(fields);
  return flatFields.reduce(
    (acc, field) => {
      // Only add fields that have a key (skip group-level configurations)
      if (field.key) {
        acc[field.key] = field;
      }
      return acc;
    },
    {} as Record<string, FilterFieldConfig<T>>,
  );
};

// Helper function to create operators from i18n config
const createOperatorsFromI18n = (i18n: FilterI18nConfig): Record<string, FilterOperator[]> => ({
  select: [
    { value: 'is', label: i18n.operators.is },
    { value: 'is_not', label: i18n.operators.isNot },
    { value: 'empty', label: i18n.operators.empty },
    { value: 'not_empty', label: i18n.operators.notEmpty },
  ],
  multiselect: [
    { value: 'is_any_of', label: i18n.operators.isAnyOf },
    { value: 'is_not_any_of', label: i18n.operators.isNotAnyOf },
    { value: 'includes_all', label: i18n.operators.includesAll },
    { value: 'excludes_all', label: i18n.operators.excludesAll },
    { value: 'empty', label: i18n.operators.empty },
    { value: 'not_empty', label: i18n.operators.notEmpty },
  ],
  date: [
    { value: 'before', label: i18n.operators.before },
    { value: 'after', label: i18n.operators.after },
    { value: 'is', label: i18n.operators.is },
    { value: 'is_not', label: i18n.operators.isNot },
    { value: 'empty', label: i18n.operators.empty },
    { value: 'not_empty', label: i18n.operators.notEmpty },
  ],
  daterange: [
    { value: 'between', label: i18n.operators.between },
    { value: 'not_between', label: i18n.operators.notBetween },
    { value: 'empty', label: i18n.operators.empty },
    { value: 'not_empty', label: i18n.operators.notEmpty },
  ],
  text: [
    { value: 'contains', label: i18n.operators.contains },
    { value: 'not_contains', label: i18n.operators.notContains },
    { value: 'starts_with', label: i18n.operators.startsWith },
    { value: 'ends_with', label: i18n.operators.endsWith },
    { value: 'is', label: i18n.operators.isExactly },
    { value: 'empty', label: i18n.operators.empty },
    { value: 'not_empty', label: i18n.operators.notEmpty },
  ],
  number: [
    { value: 'equals', label: i18n.operators.equals },
    { value: 'not_equals', label: i18n.operators.notEquals },
    { value: 'greater_than', label: i18n.operators.greaterThan },
    { value: 'less_than', label: i18n.operators.lessThan },
    { value: 'between', label: i18n.operators.between },
    { value: 'empty', label: i18n.operators.empty },
    { value: 'not_empty', label: i18n.operators.notEmpty },
  ],
  numberrange: [
    { value: 'between', label: i18n.operators.between },
    { value: 'overlaps', label: i18n.operators.overlaps },
    { value: 'contains', label: i18n.operators.contains },
    { value: 'empty', label: i18n.operators.empty },
    { value: 'not_empty', label: i18n.operators.notEmpty },
  ],
  boolean: [
    { value: 'is', label: i18n.operators.is },
    { value: 'is_not', label: i18n.operators.isNot },
    { value: 'empty', label: i18n.operators.empty },
    { value: 'not_empty', label: i18n.operators.notEmpty },
  ],
  email: [
    { value: 'contains', label: i18n.operators.contains },
    { value: 'not_contains', label: i18n.operators.notContains },
    { value: 'starts_with', label: i18n.operators.startsWith },
    { value: 'ends_with', label: i18n.operators.endsWith },
    { value: 'is', label: i18n.operators.isExactly },
    { value: 'empty', label: i18n.operators.empty },
    { value: 'not_empty', label: i18n.operators.notEmpty },
  ],
  url: [
    { value: 'contains', label: i18n.operators.contains },
    { value: 'not_contains', label: i18n.operators.notContains },
    { value: 'starts_with', label: i18n.operators.startsWith },
    { value: 'ends_with', label: i18n.operators.endsWith },
    { value: 'is', label: i18n.operators.isExactly },
    { value: 'empty', label: i18n.operators.empty },
    { value: 'not_empty', label: i18n.operators.notEmpty },
  ],
  tel: [
    { value: 'contains', label: i18n.operators.contains },
    { value: 'not_contains', label: i18n.operators.notContains },
    { value: 'starts_with', label: i18n.operators.startsWith },
    { value: 'ends_with', label: i18n.operators.endsWith },
    { value: 'is', label: i18n.operators.isExactly },
    { value: 'empty', label: i18n.operators.empty },
    { value: 'not_empty', label: i18n.operators.notEmpty },
  ],
  time: [
    { value: 'before', label: i18n.operators.before },
    { value: 'after', label: i18n.operators.after },
    { value: 'is', label: i18n.operators.is },
    { value: 'between', label: i18n.operators.between },
    { value: 'empty', label: i18n.operators.empty },
    { value: 'not_empty', label: i18n.operators.notEmpty },
  ],
  datetime: [
    { value: 'before', label: i18n.operators.before },
    { value: 'after', label: i18n.operators.after },
    { value: 'is', label: i18n.operators.is },
    { value: 'between', label: i18n.operators.between },
    { value: 'empty', label: i18n.operators.empty },
    { value: 'not_empty', label: i18n.operators.notEmpty },
  ],
});

// Default operators for different field types (using default i18n)
export const DEFAULT_OPERATORS: Record<string, FilterOperator[]> = createOperatorsFromI18n(DEFAULT_I18N);

// Helper function to get operators for a field
const getOperatorsForField = <T = unknown,>(
  field: FilterFieldConfig<T>,
  values: T[],
  i18n: FilterI18nConfig,
): FilterOperator[] => {
  if (field.operators) return field.operators;

  const operators = createOperatorsFromI18n(i18n);
  const defaultOps = operators[field.type || 'select'] || operators.select;

  // Dynamic operator selection based on values
  if (field.type === 'select' && values.length > 1) {
    return operators.multiselect;
  }

  return defaultOps;
};

interface FilterOperatorDropdownProps<T = unknown> {
  field: FilterFieldConfig<T>;
  operator: string;
  values: T[];
  onChange: (operator: string) => void;
}

function FilterOperatorDropdown<T = unknown>({ field, operator, values, onChange }: FilterOperatorDropdownProps<T>) {
  const context = useFilterContext();
  const operators = getOperatorsForField(field, values, context.i18n);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={filterOperatorVariants({ variant: context.variant, size: context.size })}>
        {operators.find((op) => op.value === operator)?.label || operator}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-fit min-w-fit">
        {operators.map((op) => (
          <DropdownMenuItem
            key={op.value}
            onClick={() => onChange(op.value)}
            className="flex items-center justify-between"
          >
            <span>{op.label}</span>
            <Check className={`text-primary ms-auto ${op.value === operator ? 'opacity-100' : 'opacity-0'}`} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface FilterValueSelectorProps<T = unknown> {
  field: FilterFieldConfig<T>;
  values: T[];
  onChange: (values: T[]) => void;
  operator: string;
}

interface SelectOptionsPopoverProps<T = unknown> {
  field: FilterFieldConfig<T>;
  values: T[];
  onChange: (values: T[]) => void;
  onClose?: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
  inline?: boolean;
}

function SelectOptionsPopover<T = unknown>({
  field,
  values,
  onChange,
  onClose,
  inline = false,
}: SelectOptionsPopoverProps<T>) {
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const context = useFilterContext();

  const isMultiSelect = field.type === 'multiselect' || values.length > 1;
  const selectedOptions = field.options?.filter((opt) => values.includes(opt.value)) || [];
  const unselectedOptions = field.options?.filter((opt) => !values.includes(opt.value)) || [];

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  // If inline mode, render the content directly without popover
  if (inline) {
    return (
      <div className="w-full">
        <Command>
          {field.searchable !== false && (
            <CommandInput
              placeholder={context.i18n.placeholders.searchField(field.label || '')}
              className="h-8.5 text-sm"
              value={searchInput}
              onValueChange={setSearchInput}
            />
          )}
          <CommandList>
            <CommandEmpty>{context.i18n.noResultsFound}</CommandEmpty>

            {/* Selected items */}
            {selectedOptions.length > 0 && (
              <CommandGroup heading={field.label || 'Selected'}>
                {selectedOptions.map((option) => (
                  <CommandItem
                    key={String(option.value)}
                    className="group flex gap-2 items-center"
                    onSelect={() => {
                      if (isMultiSelect) {
                        onChange(values.filter((v) => v !== option.value) as T[]);
                      } else {
                        onChange([] as T[]);
                      }
                    }}
                  >
                    {option.icon && option.icon}
                    <span className="text-accent-foreground truncate">{option.label}</span>
                    <Check className="text-primary ms-auto" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Available items */}
            {unselectedOptions.length > 0 && (
              <>
                {selectedOptions.length > 0 && <CommandSeparator />}
                <CommandGroup>
                  {unselectedOptions.map((option) => (
                    <CommandItem
                      key={String(option.value)}
                      className="group flex gap-2 items-center"
                      value={option.label}
                      onSelect={() => {
                        if (isMultiSelect) {
                          const newValues = [...values, option.value] as T[];
                          if (field.maxSelections && newValues.length > field.maxSelections) {
                            return; // Don't exceed max selections
                          }
                          onChange(newValues);
                          // For multiselect, don't close the popover to allow multiple selections
                        } else {
                          onChange([option.value] as T[]);
                          onClose?.();
                        }
                      }}
                    >
                      {option.icon && option.icon}
                      <span className="text-accent-foreground truncate">{option.label}</span>
                      <Check className="text-primary ms-auto opacity-0" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </div>
    );
  }

  return (
    <Popover
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) {
          setTimeout(() => setSearchInput(''), 200);
        }
      }}
    >
      <PopoverTrigger
        className={filterFieldValueVariants({
          variant: context.variant,
          size: context.size,
          cursorPointer: context.cursorPointer,
        })}
      >
        <div className="flex gap-1.5 items-center">
          {field.customValueRenderer ? (
            field.customValueRenderer(values, field.options || [])
          ) : (
            <>
              {selectedOptions.length > 0 && (
                <div className="flex items-center -space-x-1.5">
                  {selectedOptions.slice(0, 3).map((option) => (
                    <div key={String(option.value)}>{option.icon}</div>
                  ))}
                </div>
              )}
              {selectedOptions.length === 1
                ? selectedOptions[0].label
                : selectedOptions.length > 1
                  ? `${selectedOptions.length} ${context.i18n.selectedCount}`
                  : context.i18n.select}
            </>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" className={cn('w-[200px] p-0', field.className)}>
        <Command>
          {field.searchable !== false && (
            <CommandInput
              placeholder={context.i18n.placeholders.searchField(field.label || '')}
              className="h-9 text-sm"
              value={searchInput}
              onValueChange={setSearchInput}
            />
          )}
          <CommandList>
            <CommandEmpty>{context.i18n.noResultsFound}</CommandEmpty>

            {/* Selected items */}
            {selectedOptions.length > 0 && (
              <CommandGroup>
                {selectedOptions.map((option) => (
                  <CommandItem
                    key={String(option.value)}
                    className="group flex gap-2 items-center"
                    onSelect={() => {
                      if (isMultiSelect) {
                        onChange(values.filter((v) => v !== option.value) as T[]);
                      } else {
                        onChange([] as T[]);
                      }
                      if (!isMultiSelect) {
                        setOpen(false);
                        handleClose();
                      }
                    }}
                  >
                    {option.icon && option.icon}
                    <span className="text-accent-foreground truncate">{option.label}</span>
                    <Check className="text-primary ms-auto" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Available items */}
            {unselectedOptions.length > 0 && (
              <>
                {selectedOptions.length > 0 && <CommandSeparator />}
                <CommandGroup>
                  {unselectedOptions.map((option) => (
                    <CommandItem
                      key={String(option.value)}
                      className="group flex gap-2 items-center"
                      value={option.label}
                      onSelect={() => {
                        if (isMultiSelect) {
                          const newValues = [...values, option.value] as T[];
                          if (field.maxSelections && newValues.length > field.maxSelections) {
                            return; // Don't exceed max selections
                          }
                          onChange(newValues);
                        } else {
                          onChange([option.value] as T[]);
                          setOpen(false);
                          handleClose();
                        }
                      }}
                    >
                      {option.icon && option.icon}
                      <span className="text-accent-foreground truncate">{option.label}</span>
                      <Check className="text-primary ms-auto opacity-0" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function FilterValueSelector<T = unknown>({ field, values, onChange, operator }: FilterValueSelectorProps<T>) {
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const context = useFilterContext();

  // Hide value input for empty/not empty operators
  if (operator === 'empty' || operator === 'not_empty') {
    return null;
  }

  // Use custom renderer if provided
  if (field.customRenderer) {
    return (
      <div
        className={filterFieldValueVariants({
          variant: context.variant,
          size: context.size,
          cursorPointer: context.cursorPointer,
        })}
      >
        {field.customRenderer({ field, values, onChange, operator })}
      </div>
    );
  }

  if (field.type === 'boolean') {
    const isChecked = values[0] === true;

    // Use custom labels if provided, otherwise fall back to i18n defaults
    const onLabel = field.onLabel || context.i18n.true;
    const offLabel = field.offLabel || context.i18n.false;

    return (
      <div
        className={filterFieldValueVariants({
          variant: context.variant,
          size: context.size,
          cursorPointer: context.cursorPointer,
        })}
      >
        <div className="flex items-center gap-2">
          <Switch checked={isChecked} onCheckedChange={(checked) => onChange([checked as T])} size="sm" />
          {field.onLabel && field.offLabel && (
            <span className="text-xs text-muted-foreground">{isChecked ? onLabel : offLabel}</span>
          )}
        </div>
      </div>
    );
  }

  if (field.type === 'time') {
    if (operator === 'between') {
      const startTime = (values[0] as string) || '';
      const endTime = (values[1] as string) || '';

      return (
        <div className="flex items-center" data-slot="filters-item">
          <FilterInput
            type="time"
            value={startTime}
            onChange={(e) => onChange([e.target.value, endTime] as T[])}
            className={field.className}
            field={field}
          />
          <div
            data-slot="filters-between"
            className={filterFieldBetweenVariants({ variant: context.variant, size: context.size })}
          >
            {context.i18n.to}
          </div>
          <FilterInput
            type="time"
            value={endTime}
            onChange={(e) => onChange([startTime, e.target.value] as T[])}
            className={field.className}
            field={field}
          />
        </div>
      );
    }

    return (
      <FilterInput
        type="time"
        value={(values[0] as string) || ''}
        onChange={(e) => onChange([e.target.value] as T[])}
        field={field}
        className={field.className}
      />
    );
  }

  if (field.type === 'datetime') {
    if (operator === 'between') {
      const startDateTime = (values[0] as string) || '';
      const endDateTime = (values[1] as string) || '';

      return (
        <div className="flex items-center" data-slot="filters-item">
          <FilterInput
            type="datetime-local"
            value={startDateTime}
            onChange={(e) => onChange([e.target.value, endDateTime] as T[])}
            className={cn('w-36', field.className)}
            field={field}
          />
          <div
            data-slot="filters-between"
            className={filterFieldBetweenVariants({ variant: context.variant, size: context.size })}
          >
            {context.i18n.to}
          </div>
          <FilterInput
            type="datetime-local"
            value={endDateTime}
            onChange={(e) => onChange([startDateTime, e.target.value] as T[])}
            className={cn('w-36', field.className)}
            field={field}
          />
        </div>
      );
    }

    return (
      <FilterInput
        type="datetime-local"
        value={(values[0] as string) || ''}
        onChange={(e) => onChange([e.target.value] as T[])}
        className={cn('w-36', field.className)}
        field={field}
      />
    );
  }

  if (['email', 'url', 'tel'].includes(field.type || '')) {
    const getInputType = () => {
      switch (field.type) {
        case 'email':
          return 'email';
        case 'url':
          return 'url';
        case 'tel':
          return 'tel';
        default:
          return 'text';
      }
    };

    const getPattern = () => {
      switch (field.type) {
        case 'email':
          return '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$';
        case 'url':
          return '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$';
        case 'tel':
          return '^[\\+]?[1-9][\\d]{0,15}$';
        default:
          return undefined;
      }
    };

    return (
      <FilterInput
        type={getInputType()}
        value={(values[0] as string) || ''}
        onChange={(e) => onChange([e.target.value] as T[])}
        placeholder={field.placeholder || context.i18n.placeholders.enterField(field.type || 'text')}
        pattern={field.pattern || getPattern()}
        className={field.className}
        field={field}
      />
    );
  }

  if (field.type === 'daterange') {
    const startDate = (values[0] as string) || '';
    const endDate = (values[1] as string) || '';

    return (
      <div
        className={filterFieldValueVariants({
          variant: context.variant,
          size: context.size,
          cursorPointer: context.cursorPointer,
        })}
      >
        <FilterInput
          type="date"
          value={startDate}
          onChange={(e) => onChange([e.target.value, endDate] as T[])}
          className={cn('w-24', field.className)}
          field={field}
        />
        <div
          data-slot="filters-between"
          className={filterFieldBetweenVariants({ variant: context.variant, size: context.size })}
        >
          {context.i18n.to}
        </div>
        <FilterInput
          type="date"
          value={endDate}
          onChange={(e) => onChange([startDate, e.target.value] as T[])}
          className={cn('w-24', field.className)}
          field={field}
        />
      </div>
    );
  }

  // Handle different field types
  if (field.type === 'text' || field.type === 'number') {
    if (field.type === 'number' && operator === 'between') {
      const minVal = (values[0] as string) || '';
      const maxVal = (values[1] as string) || '';

      return (
        <div className="flex items-center" data-slot="filters-item">
          <FilterInput
            type="number"
            value={minVal}
            onChange={(e) => onChange([e.target.value, maxVal] as T[])}
            placeholder={context.i18n.min}
            className={cn('w-16', field.className)}
            min={field.min}
            max={field.max}
            step={field.step}
            pattern={field.pattern}
            field={field}
          />
          <div
            data-slot="filters-between"
            className={filterFieldBetweenVariants({ variant: context.variant, size: context.size })}
          >
            {context.i18n.to}
          </div>
          <FilterInput
            type="number"
            value={maxVal}
            onChange={(e) => onChange([minVal, e.target.value] as T[])}
            placeholder={context.i18n.max}
            className={cn('w-16', field.className)}
            min={field.min}
            max={field.max}
            step={field.step}
            pattern={field.pattern}
            field={field}
          />
        </div>
      );
    }

    return (
      <div className="flex items-center" data-slot="filters-item">
        <FilterInput
          type={field.type === 'number' ? 'number' : 'text'}
          value={(values[0] as string) || ''}
          onChange={(e) => onChange([e.target.value] as T[])}
          placeholder={field.placeholder}
          min={field.type === 'number' ? field.min : undefined}
          max={field.type === 'number' ? field.max : undefined}
          step={field.type === 'number' ? field.step : undefined}
          pattern={field.pattern}
          field={field}
          className={cn('w-36', field.className)}
        />
      </div>
    );
  }

  if (field.type === 'date') {
    return (
      <FilterInput
        type="date"
        value={(values[0] as string) || ''}
        onChange={(e) => onChange([e.target.value] as T[])}
        field={field}
        className={cn('w-16', field.className)}
      />
    );
  }

  // For select and multiselect types, use the SelectOptionsPopover component
  if (field.type === 'select' || field.type === 'multiselect') {
    return <SelectOptionsPopover field={field} values={values} onChange={onChange} />;
  }

  const isMultiSelect = values.length > 1;
  const selectedOptions = field.options?.filter((opt) => values.includes(opt.value)) || [];
  const unselectedOptions = field.options?.filter((opt) => !values.includes(opt.value)) || [];

  return (
    <Popover
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) {
          setTimeout(() => setSearchInput(''), 200);
        }
      }}
    >
      <PopoverTrigger
        className={filterFieldValueVariants({
          variant: context.variant,
          size: context.size,
          cursorPointer: context.cursorPointer,
        })}
      >
        <div className="flex gap-1.5 items-center">
          {field.customValueRenderer ? (
            field.customValueRenderer(values, field.options || [])
          ) : (
            <>
              {selectedOptions.length > 0 && (
                <div className="flex items-center -space-x-1.5">
                  {selectedOptions.slice(0, 3).map((option) => (
                    <div key={String(option.value)}>{option.icon}</div>
                  ))}
                </div>
              )}
              {selectedOptions.length === 1
                ? selectedOptions[0].label
                : selectedOptions.length > 1
                  ? `${selectedOptions.length} ${context.i18n.selectedCount}`
                  : context.i18n.select}
            </>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className={cn('w-36 p-0', field.popoverContentClassName)}>
        <Command>
          {field.searchable !== false && (
            <CommandInput
              placeholder={context.i18n.placeholders.searchField(field.label || '')}
              className="h-9 text-sm"
              value={searchInput}
              onValueChange={setSearchInput}
            />
          )}
          <CommandList>
            <CommandEmpty>{context.i18n.noResultsFound}</CommandEmpty>

            {/* Selected items */}
            {selectedOptions.length > 0 && (
              <CommandGroup>
                {selectedOptions.map((option) => (
                  <CommandItem
                    key={String(option.value)}
                    className="group flex gap-2 items-center"
                    onSelect={() => {
                      if (isMultiSelect) {
                        onChange(values.filter((v) => v !== option.value) as T[]);
                      } else {
                        onChange([] as T[]);
                      }
                      if (!isMultiSelect) setOpen(false);
                    }}
                  >
                    {option.icon && option.icon}
                    <span className="text-accent-foreground truncate">{option.label}</span>
                    <Check className="text-primary ms-auto" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Available items */}
            {unselectedOptions.length > 0 && (
              <>
                {selectedOptions.length > 0 && <CommandSeparator />}
                <CommandGroup>
                  {unselectedOptions.map((option) => (
                    <CommandItem
                      key={String(option.value)}
                      className="group flex gap-2 items-center"
                      value={option.label}
                      onSelect={() => {
                        if (isMultiSelect) {
                          const newValues = [...values, option.value] as T[];
                          if (field.maxSelections && newValues.length > field.maxSelections) {
                            return; // Don't exceed max selections
                          }
                          onChange(newValues);
                        } else {
                          onChange([option.value] as T[]);
                          setOpen(false);
                        }
                      }}
                    >
                      {option.icon && option.icon}
                      <span className="text-accent-foreground truncate">{option.label}</span>
                      <Check className="text-primary ms-auto opacity-0" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export interface Filter<T = unknown> {
  id: string;
  field: string;
  operator: string;
  values: T[];
}

export interface FilterGroup<T = unknown> {
  id: string;
  label?: string;
  filters: Filter<T>[];
  fields: FilterFieldConfig<T>[];
}

// FiltersContent component for the filter panel content
interface FiltersContentProps<T = unknown> {
  filters: Filter<T>[];
  fields: FilterFieldsConfig<T>;
  onChange: (filters: Filter<T>[]) => void;
}

export const FiltersContent = <T = unknown,>({ filters, fields, onChange }: FiltersContentProps<T>) => {
  const context = useFilterContext();
  const fieldsMap = useMemo(() => getFieldsMap(fields), [fields]);

  const updateFilter = useCallback(
    (filterId: string, updates: Partial<Filter<T>>) => {
      onChange(
        filters.map((filter) => {
          if (filter.id === filterId) {
            const updatedFilter = { ...filter, ...updates };
            // Clear values for empty/not empty operators
            if (updates.operator === 'empty' || updates.operator === 'not_empty') {
              updatedFilter.values = [] as T[];
            }
            return updatedFilter;
          }
          return filter;
        }),
      );
    },
    [filters, onChange],
  );

  const removeFilter = useCallback(
    (filterId: string) => {
      onChange(filters.filter((filter) => filter.id !== filterId));
    },
    [filters, onChange],
  );

  return (
    <div className={cn(filtersContainerVariants({ variant: context.variant, size: context.size }), context.className)}>
      {filters.map((filter) => {
        const field = fieldsMap[filter.field];
        if (!field) return null;

        return (
          <div key={filter.id} className={filterItemVariants({ variant: context.variant })} data-slot="filter-item">
            {/* Field Label */}
            <div
              className={filterFieldLabelVariants({
                variant: context.variant,
                size: context.size,
                radius: context.radius,
              })}
            >
              {field.icon}
              {field.label}
            </div>

            {/* Operator Dropdown */}
            <FilterOperatorDropdown<T>
              field={field}
              operator={filter.operator}
              values={filter.values}
              onChange={(operator) => updateFilter(filter.id, { operator })}
            />

            {/* Value Selector */}
            <FilterValueSelector<T>
              field={field}
              values={filter.values}
              onChange={(values) => updateFilter(filter.id, { values })}
              operator={filter.operator}
            />

            {/* Remove Button */}
            <FilterRemoveButton onClick={() => removeFilter(filter.id)} />
          </div>
        );
      })}
    </div>
  );
};

interface FiltersProps<T = unknown> {
  filters: Filter<T>[];
  fields: FilterFieldsConfig<T>;
  onChange: (filters: Filter<T>[]) => void;
  className?: string;
  showAddButton?: boolean;
  addButtonText?: string;
  addButtonIcon?: React.ReactNode;
  addButtonClassName?: string;
  addButton?: React.ReactNode;
  variant?: 'solid' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  radius?: 'md' | 'full';
  i18n?: Partial<FilterI18nConfig>;
  showSearchInput?: boolean;
  cursorPointer?: boolean;
  trigger?: React.ReactNode;
  allowMultiple?: boolean;
  popoverContentClassName?: string;
}

export function Filters<T = unknown>({
  filters,
  fields,
  onChange,
  className,
  showAddButton = true,
  addButtonText,
  addButtonIcon,
  addButtonClassName,
  addButton,
  variant = 'outline',
  size = 'md',
  radius = 'md',
  i18n,
  showSearchInput = true,
  cursorPointer = true,
  trigger,
  allowMultiple = true,
  popoverContentClassName,
}: FiltersProps<T>) {
  const [addFilterOpen, setAddFilterOpen] = useState(false);
  const [selectedFieldForOptions, setSelectedFieldForOptions] = useState<FilterFieldConfig<T> | null>(null);
  const [tempSelectedValues, setTempSelectedValues] = useState<unknown[]>([]);

  // Merge provided i18n with defaults
  const mergedI18n: FilterI18nConfig = {
    ...DEFAULT_I18N,
    ...i18n,
    operators: {
      ...DEFAULT_I18N.operators,
      ...i18n?.operators,
    },
    placeholders: {
      ...DEFAULT_I18N.placeholders,
      ...i18n?.placeholders,
    },
    validation: {
      ...DEFAULT_I18N.validation,
      ...i18n?.validation,
    },
  };

  const fieldsMap = useMemo(() => getFieldsMap(fields), [fields]);

  const updateFilter = useCallback(
    (filterId: string, updates: Partial<Filter<T>>) => {
      onChange(
        filters.map((filter) => {
          if (filter.id === filterId) {
            const updatedFilter = { ...filter, ...updates };
            // Clear values for empty/not empty operators
            if (updates.operator === 'empty' || updates.operator === 'not_empty') {
              updatedFilter.values = [] as T[];
            }
            return updatedFilter;
          }
          return filter;
        }),
      );
    },
    [filters, onChange],
  );

  const removeFilter = useCallback(
    (filterId: string) => {
      onChange(filters.filter((filter) => filter.id !== filterId));
    },
    [filters, onChange],
  );

  const addFilter = useCallback(
    (fieldKey: string) => {
      const field = fieldsMap[fieldKey];
      if (field && field.key) {
        // For select and multiselect types, show options directly
        if (field.type === 'select' || field.type === 'multiselect') {
          setSelectedFieldForOptions(field);
          // For multiselect, check if there's already a filter and use its values
          const existingFilter = filters.find((f) => f.field === fieldKey);
          const initialValues = field.type === 'multiselect' && existingFilter ? existingFilter.values : [];
          setTempSelectedValues(initialValues);
          return;
        }

        // For other types, add filter directly
        const defaultOperator =
          field.type === 'daterange'
            ? 'between'
            : field.type === 'numberrange'
              ? 'between'
              : field.type === 'boolean'
                ? 'is'
                : 'is';
        let defaultValues: unknown[] = [];

        if (['text', 'number', 'date', 'email', 'url', 'tel', 'time', 'datetime'].includes(field.type || '')) {
          defaultValues = [''] as unknown[];
        } else if (field.type === 'daterange') {
          defaultValues = ['', ''] as unknown[];
        } else if (field.type === 'numberrange') {
          defaultValues = [field.min || 0, field.max || 100] as unknown[];
        } else if (field.type === 'boolean') {
          defaultValues = [false] as unknown[];
        } else if (field.type === 'time') {
          defaultValues = [''] as unknown[];
        } else if (field.type === 'datetime') {
          defaultValues = [''] as unknown[];
        }

        const newFilter = createFilter<T>(fieldKey, defaultOperator, defaultValues as T[]);
        const newFilters = [...filters, newFilter];
        onChange(newFilters);
        setAddFilterOpen(false);
      }
    },
    [fieldsMap, filters, onChange],
  );

  const addFilterWithOption = useCallback(
    (field: FilterFieldConfig<T>, values: unknown[], closePopover: boolean = true) => {
      if (!field.key) return;

      const defaultOperator = field.type === 'multiselect' ? 'is_any_of' : 'is';

      // If allowMultiple is true, always create a new filter
      if (allowMultiple) {
        const newFilter = createFilter<T>(field.key, defaultOperator, values as T[]);
        const newFilters = [...filters, newFilter];
        onChange(newFilters);
      } else {
        // Check if there's already a filter for this field
        const existingFilterIndex = filters.findIndex((f) => f.field === field.key);

        if (existingFilterIndex >= 0 && field.type === 'multiselect') {
          // Update existing multiselect filter
          const updatedFilters = [...filters];
          updatedFilters[existingFilterIndex] = {
            ...updatedFilters[existingFilterIndex],
            values: values as T[],
          };
          onChange(updatedFilters);
        } else {
          // Create new filter
          const newFilter = createFilter<T>(field.key, defaultOperator, values as T[]);
          const newFilters = [...filters, newFilter];
          onChange(newFilters);
        }
      }

      if (closePopover) {
        setAddFilterOpen(false);
        setSelectedFieldForOptions(null);
        setTempSelectedValues([]);
      } else {
        // For multiselect, keep popover open but update temp values
        setTempSelectedValues(values as unknown[]);
      }
    },
    [filters, onChange, allowMultiple],
  );

  const selectableFields = useMemo(() => {
    const flatFields = flattenFields(fields);
    return flatFields.filter((field) => {
      // Only include actual filterable fields (must have key and type)
      if (!field.key || field.type === 'separator') {
        return false;
      }
      // If allowMultiple is true, don't filter out fields that already have filters
      if (allowMultiple) {
        return true;
      }
      // Filter out fields that already have filters (default behavior)
      return !filters.some((filter) => filter.field === field.key);
    });
  }, [fields, filters, allowMultiple]);

  return (
    <FilterContext.Provider
      value={{
        variant,
        size,
        radius,
        i18n: mergedI18n,
        cursorPointer,
        className,
        showAddButton,
        addButtonText,
        addButtonIcon,
        addButtonClassName,
        addButton,
        showSearchInput,
        trigger,
        allowMultiple,
      }}
    >
      <div className={cn(filtersContainerVariants({ variant, size }), className)}>
        {showAddButton && selectableFields.length > 0 && (
          <Popover
            open={addFilterOpen}
            onOpenChange={(open) => {
              setAddFilterOpen(open);
              if (!open) {
                setSelectedFieldForOptions(null);
                setTempSelectedValues([]);
              }
            }}
          >
            <PopoverTrigger asChild>
              {addButton ? (
                addButton
              ) : (
                <button
                  className={cn(
                    filterAddButtonVariants({
                      variant: variant,
                      size: size,
                      cursorPointer: cursorPointer,
                      radius: radius,
                    }),
                    addButtonClassName,
                  )}
                  title={mergedI18n.addFilterTitle}
                >
                  {addButtonIcon || <Plus />}
                  {addButtonText || mergedI18n.addFilter}
                </button>
              )}
            </PopoverTrigger>
            <PopoverContent className={cn('w-[200px] p-0', popoverContentClassName)} align="start">
              <Command>
                {selectedFieldForOptions ? (
                  // Show original select/multiselect rendering without back button
                  <SelectOptionsPopover<T>
                    field={selectedFieldForOptions}
                    values={tempSelectedValues as T[]}
                    onChange={(values) => {
                      // For multiselect, create filter immediately but keep popover open
                      // For single select, create filter and close popover
                      const shouldClosePopover = selectedFieldForOptions.type === 'select';
                      addFilterWithOption(selectedFieldForOptions, values as unknown[], shouldClosePopover);
                    }}
                    onClose={() => setAddFilterOpen(false)}
                    inline={true}
                  />
                ) : (
                  // Show field selection
                  <>
                    {showSearchInput && <CommandInput placeholder={mergedI18n.searchFields} className="h-9" />}
                    <CommandList>
                      <CommandEmpty>{mergedI18n.noFieldsFound}</CommandEmpty>
                      {fields.map((item, index) => {
                        // Handle grouped fields (FilterFieldGroup structure)
                        if (isFieldGroup(item)) {
                          const groupFields = item.fields.filter((field) => {
                            // Include separators and labels for display
                            if (field.type === 'separator') {
                              return true;
                            }
                            // If allowMultiple is true, don't filter out fields that already have filters
                            if (allowMultiple) {
                              return true;
                            }
                            // Filter out fields that already have filters (default behavior)
                            return !filters.some((filter) => filter.field === field.key);
                          });

                          if (groupFields.length === 0) return null;

                          return (
                            <CommandGroup key={`group-${index}`} heading={item.group || 'Fields'}>
                              {groupFields.map((field, fieldIndex) => {
                                // Handle separator
                                if (field.type === 'separator') {
                                  return <CommandSeparator key={`separator-${fieldIndex}`} />;
                                }

                                // Regular field
                                return (
                                  <CommandItem key={field.key} onSelect={() => field.key && addFilter(field.key)}>
                                    {field.icon}
                                    <span>{field.label}</span>
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          );
                        }

                        // Handle group-level fields (new FilterFieldConfig structure with group property)
                        if (isGroupLevelField(item)) {
                          const groupFields = item.fields!.filter((field) => {
                            // Include separators and labels for display
                            if (field.type === 'separator') {
                              return true;
                            }
                            // If allowMultiple is true, don't filter out fields that already have filters
                            if (allowMultiple) {
                              return true;
                            }
                            // Filter out fields that already have filters (default behavior)
                            return !filters.some((filter) => filter.field === field.key);
                          });

                          if (groupFields.length === 0) return null;

                          return (
                            <CommandGroup key={`group-${index}`} heading={item.group || 'Fields'}>
                              {groupFields.map((field, fieldIndex) => {
                                // Handle separator
                                if (field.type === 'separator') {
                                  return <CommandSeparator key={`separator-${fieldIndex}`} />;
                                }

                                // Regular field
                                return (
                                  <CommandItem key={field.key} onSelect={() => field.key && addFilter(field.key)}>
                                    {field.icon}
                                    <span>{field.label}</span>
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          );
                        }

                        // Handle flat field configuration (backward compatibility)
                        const field = item as FilterFieldConfig<T>;

                        // Handle separator
                        if (field.type === 'separator') {
                          return <CommandSeparator key={`separator-${index}`} />;
                        }

                        // Regular field
                        return (
                          <CommandItem key={field.key} onSelect={() => field.key && addFilter(field.key)}>
                            {field.icon}
                            <span>{field.label}</span>
                          </CommandItem>
                        );
                      })}
                    </CommandList>
                  </>
                )}
              </Command>
            </PopoverContent>
          </Popover>
        )}

        {filters.map((filter) => {
          const field = fieldsMap[filter.field];
          if (!field) return null;

          return (
            <div key={filter.id} className={filterItemVariants({ variant })} data-slot="filter-item">
              {/* Field Label */}
              <div className={filterFieldLabelVariants({ variant: variant, size: size, radius: radius })}>
                {field.icon}
                {field.label}
              </div>

              {/* Operator Dropdown */}
              <FilterOperatorDropdown<T>
                field={field}
                operator={filter.operator}
                values={filter.values}
                onChange={(operator) => updateFilter(filter.id, { operator })}
              />

              {/* Value Selector */}
              <FilterValueSelector<T>
                field={field}
                values={filter.values}
                onChange={(values) => updateFilter(filter.id, { values })}
                operator={filter.operator}
              />

              {/* Remove Button */}
              <FilterRemoveButton onClick={() => removeFilter(filter.id)} />
            </div>
          );
        })}
      </div>
    </FilterContext.Provider>
  );
}

export const createFilter = <T = unknown,>(field: string, operator?: string, values: T[] = []): Filter<T> => ({
  id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
  field,
  operator: operator || 'is',
  values,
});

export const createFilterGroup = <T = unknown,>(
  id: string,
  label: string,
  fields: FilterFieldConfig<T>[],
  initialFilters: Filter<T>[] = [],
): FilterGroup<T> => ({
  id,
  label,
  filters: initialFilters,
  fields,
});
