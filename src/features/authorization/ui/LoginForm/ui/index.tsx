import { zodResolver } from '@hookform/resolvers/zod';
import type { AxiosError } from 'axios';
import { clsx } from 'clsx';
import { Eye, EyeOff } from 'lucide-react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useLoginUser } from '@/features/authorization';
import type { ErrorResponse } from '@/shared/types';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';

import type { AuthFormProps } from '../../RegForm';

import '../../styles/auth-form.scss';
import './login-form.scss';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginSchema = z.object({
  login: z
    .string()
    .trim()
    .min(1, 'Введите адрес электронной почты')
    .refine((value) => emailPattern.test(value), 'Введите корректный адрес электронной почты'),
  password: z
    .string()
    .min(6, 'Пароль должен содержать от 6 до 20 символов')
    .max(20, 'Пароль должен содержать от 6 до 20 символов'),
});

type LoginFormValue = z.infer<typeof LoginSchema>;

export const LoginForm = ({ onSwitch, onClose }: AuthFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<LoginFormValue>({
    resolver: zodResolver(LoginSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const { mutate, isPending } = useLoginUser();

  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = (data: LoginFormValue) => {
    mutate(data, {
      onSuccess: () => {
        onClose?.(false);
        reset();
      },
      onError: (error) => {
        console.warn(error);
        const axiosError = error as AxiosError<ErrorResponse>;
        setError('root', {
          message: axiosError.response?.data.message ?? 'Ошибка соединения с сервером',
        });
        setTimeout(() => {
          formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
          formRef.current?.closest('.dialog')?.scrollBy({ top: 50, behavior: 'smooth' });
        }, 100);
      },
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
      <div className="auth-form__field">
        <label className="auth-form__label" htmlFor="login">
          Электронная почта
        </label>
        <input
          className={clsx('auth-form__input', {
            'auth-form__input--error': errors.login,
          })}
          {...register('login')}
          type="email"
          id="login"
          placeholder="ivan@example.com"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          aria-invalid={Boolean(errors.login)}
        />
        <ErrorMessage message={errors.login?.message} className="auth-form__error" />
      </div>

      <div className="auth-form__field">
        <label className="auth-form__label" htmlFor="password">
          Пароль
        </label>
        <div className="auth-form__input-wrap">
          <input
            className={clsx('auth-form__input', 'auth-form__input--password', {
              'auth-form__input--error': errors.password,
            })}
            {...register('password')}
            type={isPasswordVisible ? 'text' : 'password'}
            id="password"
            placeholder="от 6 до 20 символов"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
          />
          <button
            title={isPasswordVisible ? 'Скрыть пароль' : 'Показать пароль'}
            type="button"
            className="auth-form__toggle"
            onClick={() => setPasswordVisible((prevState) => !prevState)}
          >
            {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <ErrorMessage message={errors.password?.message} className="auth-form__error" />
      </div>

      <ErrorMessage
        message={errors.root?.message}
        className="auth-form__error auth-form__error--root"
      />

      <button type="submit" className="auth-form__submit login-submit" disabled={isPending}>
        {isPending ? 'Загрузка...' : 'Войти в аккаунт'}
      </button>

      <div className="auth-form__footer">
        <button type="button" className="auth-form__link">
          Забыли пароль?
        </button>
        <button type="button" className="auth-form__link" onClick={onSwitch}>
          Регистрация
        </button>
      </div>
    </form>
  );
};
