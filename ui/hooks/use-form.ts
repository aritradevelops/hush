import { debounce } from "@/lib/utils";
import { FormEvent, useEffect, useState } from "react";
import { z } from "zod";

type Obj = Record<string, unknown>;

type Fields<T extends Obj> = Record<keyof T, { errors: string[]; id: string }>;
type OnSubmit<T extends Obj> = (data: T) => Promise<{ fields: Partial<Fields<T>>; success: boolean; message: string }>;

interface FormState<T extends Obj> {
  id: string;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  state: "none" | "success" | "error";
  message: string | null;
}

export function useForm<T extends z.ZodObject<any>>(params: { zodSchema: T; id: string; onSubmit: OnSubmit<z.infer<T>> }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<z.infer<T>>();

  const schemaKeys = Object.keys(params.zodSchema.shape);
  const ids: string[] = [];
  const initialFields = schemaKeys.reduce((acc, field) => {
    ids.push(field);
    return {
      ...acc,
      [field]: { errors: [], id: field },
    };
  }, {} as Fields<z.infer<T>>);

  const [fields, setFields] = useState<Fields<z.infer<T>>>(initialFields);

  function validateAndShowError(rawData: any) {
    const result = params.zodSchema.safeParse(rawData || {});
    if (!result.success) {
      const flattenedErrors = result.error.flatten().fieldErrors;
      const newFields = Object.assign({}, fields);

      for (const field of ids) {
        newFields[field].errors = flattenedErrors[field] || [];
      }
      setFields(newFields);
      return false;
    }
    return true;
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const isValid = validateAndShowError(data);
      if (!isValid) return;
      const result = await params.onSubmit(data!);

      setForm((prev) => ({
        ...prev,
        state: result.success ? "success" : "error",
        message: result.message,
      }));
    } catch (error) {
      setForm((prev) => ({
        ...prev,
        state: "error",
        message: (error as Error).message,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const [form, setForm] = useState<FormState<z.infer<T>>>({
    id: params.id,
    onSubmit: handleSubmit,
    state: "none",
    message: null,
  });

  useEffect(() => {
    const handleChange = debounce((e: Event) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      if (target && target.id && ids.includes(target.id)) {
        setData((prevData) => {
          const newData = { ...prevData, [target.id]: target.value };
          if (validateAndShowError(newData)) {
            setFields({ ...initialFields });
          }
          return newData;
        });
      }
    })

    document.addEventListener("input", handleChange);
    return () => {
      document.removeEventListener("input", handleChange);
    };
  }, []);

  return {
    isSubmitting,
    form,
    fields,
  };
}
