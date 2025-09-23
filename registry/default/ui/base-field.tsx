import { cn } from '@/registry/default/lib/utils';
import { Field as BaseField } from '@base-ui-components/react/field';

function Field({ className, ...props }: React.ComponentProps<typeof BaseField.Root>) {
  return (
    <BaseField.Root
      data-slot="field"
      className={cn(
        'flex flex-col gap-2 has-[[data-slot=field-error]]:[&_[data-slot=field-description]]:hidden',
        className,
      )}
      {...props}
    />
  );
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof BaseField.Label>) {
  return (
    <BaseField.Label
      data-slot="field-label"
      className={cn('text-sm font-medium text-foreground', className)}
      {...props}
    />
  );
}

function FieldError({ className, ...props }: React.ComponentProps<typeof BaseField.Error>) {
  return (
    <BaseField.Error
      data-slot="field-error"
      className={cn('text-xs font-normal text-destructive', className)}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: React.ComponentProps<typeof BaseField.Description>) {
  return (
    <BaseField.Description
      data-slot="field-description"
      className={cn('text-xs text-muted-foreground', className)}
      {...props}
    />
  );
}

function FieldControl({ ...props }: React.ComponentProps<typeof BaseField.Control>) {
  return <BaseField.Control data-slot="field-control" {...props} />;
}

export { Field, FieldLabel, FieldError, FieldDescription, FieldControl };
