import { debounce } from "@/lib/utils";
import { FormEvent, useEffect, useState } from "react";
import { z, ZodObject, ZodEffects, ZodTypeAny } from "zod";

export type Obj = Record<string, unknown>;

export type Fields<T extends Obj> = Record<
  keyof T,
  { errors: string[]; id: string }
>;

export type OnSubmit<T extends Obj> = (
  data: T
) => Promise<{ fields: Partial<Fields<T>>; success: boolean; message: string }>;

interface FormState<T extends Obj> {
  id: string;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  state: "none" | "success" | "error";
  message: string | null;
}

export function useForm<T extends ZodTypeAny>(params: {
  zodSchema: T;
  id: string;
  onSubmit: OnSubmit<z.infer<T>>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<z.infer<T>>({} as z.infer<T>);

  // Extract base schema if wrapped in ZodEffects
  const baseSchema = params.zodSchema instanceof ZodEffects ? params.zodSchema._def.schema : params.zodSchema;
  const schemaKeys = Object.keys((baseSchema as ZodObject<any>).shape);
  const ids = schemaKeys;

  const cloneFields = (fields: Fields<z.infer<T>>): Fields<z.infer<T>> =>
    Object.fromEntries(
      Object.entries(fields).map(([key, value]) => [
        key,
        { ...value, errors: [...value.errors] },
      ])
    ) as Fields<z.infer<T>>;

  const initialFields: Fields<z.infer<T>> = schemaKeys.reduce(
    (acc, field) => ({
      ...acc,
      [field]: { errors: [], id: field },
    }),
    {} as Fields<z.infer<T>>
  );

  const [fields, setFields] = useState<Fields<z.infer<T>>>(cloneFields(initialFields));

  function validateAndShowError(rawData: any) {
    const result = params.zodSchema.safeParse(rawData || {});
    if (!result.success) {
      const flattenedErrors = result.error.flatten().fieldErrors;
      const newFields = cloneFields(initialFields);
      for (const field of ids) {
        newFields[field].errors = flattenedErrors[field] || [];
      }
      setFields(newFields);
      return false;
    }
    setFields(cloneFields(initialFields));
    return true;
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    setData((prevData) => {
      const newData = { ...prevData };
      if (!validateAndShowError(newData)) {
        setIsSubmitting(false);
        return prevData;
      }

      (async () => {
        try {
          const result = await params.onSubmit(newData);
          setForm((prev) => ({
            ...prev,
            state: result.success ? "success" : "error",
            message: result.message,
          }));

          if (!result.success) {
            setFields((prev) => ({
              ...cloneFields(prev),
              ...result.fields,
            }));
          }
        } catch (error) {
          setForm((prev) => ({
            ...prev,
            state: "error",
            message: (error as Error).message,
          }));
        } finally {
          setIsSubmitting(false);
        }
      })();
      return newData;
    });
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
            setFields(cloneFields(initialFields));
          }
          return newData;
        });
      }
    });
    document.addEventListener("input", handleChange);
    return () => document.removeEventListener("input", handleChange);
  }, []);

  return { isSubmitting, form, fields };
}
