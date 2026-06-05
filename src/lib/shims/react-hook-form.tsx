import { useState } from 'react';

export function useForm(options: any = {}) {
  const [values, setValues] = useState<any>(options.defaultValues || {});
  const [errors] = useState<any>({});

  const register = (name: string) => {
    const isCheckbox = name === 'residential_flag';
    return {
      name,
      onChange: (e: any) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : (e.target.type === 'number' ? Number(e.target.value) : e.target.value);
        setValues((v: any) => ({ ...v, [name]: val }));
      },
      value: isCheckbox ? undefined : (values[name] ?? ''),
      checked: isCheckbox ? !!values[name] : undefined
    };
  };

  const handleSubmit = (onSubmit: any) => (e: any) => {
    e?.preventDefault();
    onSubmit(values);
  };

  const reset = (newValues: any) => {
    setValues(newValues || {});
  };

  const watch = (name: string) => {
    return values[name];
  };

  const setValue = (name: string, value: any) => {
    setValues((v: any) => ({ ...v, [name]: value }));
  };

  return {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    values,
    formState: { errors, isValid: true }
  };
}
