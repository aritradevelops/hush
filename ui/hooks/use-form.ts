import { useState, useEffect } from 'react';
import { z, ZodError, ZodSchema } from 'zod';

// Field interface for individual form fields
interface Field {
  id: string;
  value: any;
  errors: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Form interface for form element properties
interface FormProps {
  id: string;
  onSubmit: (e: React.FormEvent) => void;
}

const useForm = <T extends Record<string, any>>(
  zodSchema: ZodSchema<T>,
  initialValues: T
): [FormProps, { [K in keyof T]: Omit<Field, 'value'> }] => {
  const [fields, setFields] = useState<{ [K in keyof T]: Field }>(() =>
    Object.keys(initialValues).reduce((acc, key) => {
      acc[key as keyof T] = {
        id: key,
        value: initialValues[key],
        errors: [],
        onChange: () => { },
      };
      return acc;
    }, {} as { [K in keyof T]: Field })
  );

  const [isValid, setIsValid] = useState(false);

  // Validate the form whenever fields change
  useEffect(() => {
    validateForm();
  }, [fields]);

  const validateForm = () => {
    try {
      const values = Object.keys(fields).reduce((acc, key) => {
        // @ts-ignore
        acc[key] = fields[key].value;
        return acc;
      }, {} as T);

      zodSchema.parse(values);

      setFields((prevFields) => {
        const newFields = { ...prevFields };
        Object.keys(newFields).forEach((key) => {
          newFields[key].errors = [];
        });
        return newFields;
      });

      setIsValid(true);
    } catch (error) {
      if (error instanceof ZodError) {
        const newFields = { ...fields };

        // Clear previous errors
        Object.keys(newFields).forEach((key) => {
          newFields[key].errors = [];
        });

        // Set new errors
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof T;
          if (newFields[path]) {
            newFields[path].errors.push(err.message);
          }
        });

        setFields(newFields);
        setIsValid(false);
      }
    }
  };

  const handleFieldChange = (id: keyof T, value: any) => {
    setFields((prevFields) => ({
      ...prevFields,
      [id]: {
        ...prevFields[id],
        value,
      },
    }));
  };

  // Prepare form and fields
  const formProps: FormProps = {
    id: 'form',
    onSubmit: (e: React.FormEvent) => {
      e.preventDefault();
      validateForm();

      if (isValid) {
        const values = Object.keys(fields).reduce((acc, key) => {
          acc[key] = fields[key].value;
          return acc;
        }, {} as T);

        // You can add your submit logic here or pass a callback
        console.log('Form submitted with values:', values);
      }
    }
  };

  // Attach onChange handlers to fields
  const fieldsWithHandlers = Object.keys(fields).reduce((acc, key) => {
    acc[key] = {
      id: fields[key].id,
      errors: fields[key].errors.join(', '), // Convert errors to comma-separated string
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        handleFieldChange(key as keyof T, e.target.value),
    };
    return acc;
  }, {} as { [K in keyof T]: Omit<Field, 'value'> });

  return [formProps, fieldsWithHandlers];
};

export default useForm;