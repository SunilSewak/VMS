import { useState } from 'react';

export function useForm(_options: any = {}) {
  const [values, setValues] = useState<any>({});
  const [errors] = useState<any>({});

  const register = (name: string) => ({
    name,
    onChange: (e: any) => {
      setValues((v: any) => ({ ...v, [name]: e.target.value }));
    },
    value: values[name] || ''
  });

  const handleSubmit = (onSubmit: any) => (e: any) => {
    e?.preventDefault();
    onSubmit(values);
  };

  return {
    register,
    handleSubmit,
    formState: { errors, isValid: true }
  };
}
