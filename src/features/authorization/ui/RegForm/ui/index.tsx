import { zodResolver } from '@hookform/resolvers/zod';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Label from '@radix-ui/react-label';
import type { AxiosError } from 'axios';
import { clsx } from 'clsx';
import { Check, Eye, EyeOff } from 'lucide-react';
import {
  useRef,
  useState,
  type Dispatch,
  type MouseEventHandler,
  type SetStateAction,
} from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useCreateUser } from '@/features/authorization';
import type { ErrorResponse } from '@/shared/types';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';

import '../../styles/auth-form.scss';

const passwordRule = 'Пароль должен содержать от 6 до 20 символов';
const loginPattern = /^[a-zA-Z0-9._-]{5,30}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RegSchema = z
  .object({
    login: z
      .string()
      .trim()
      .min(1, 'Введите адрес электронной почты')
      .refine(
        (value) => emailPattern.test(value) || loginPattern.test(value),
        'Введите корректный адрес электронной почты',
      ),
    password: z.string().min(6, passwordRule).max(20, passwordRule),
    confirmPassword: z.string().min(1, 'Повторите пароль'),
    remember: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

type RegFormValues = z.infer<typeof RegSchema>;

export interface AuthFormProps {
  onSwitch: MouseEventHandler<HTMLButtonElement>;
  onClose?: Dispatch<SetStateAction<boolean>>;
}

export const RegForm = ({ onSwitch, onClose }: AuthFormProps) => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
    trigger,
    control,
    watch,
  } = useForm<RegFormValues>({
    resolver: zodResolver(RegSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      remember: false,
    },
  });

  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isPasswordConfirmVisible, setPasswordConfirmVisible] = useState(false);

  const { mutate, isPending } = useCreateUser();

  const formRef = useRef<HTMLFormElement>(null);
  const confirmPasswordValue = watch('confirmPassword');

  const onSubmit = ({ confirmPassword: _, remember: __, login, password }: RegFormValues) => {
    mutate(
      {
        login,
        password,
      },
      {
        onSuccess: () => {
          onClose?.(false);
          reset();
          void navigate('/dashboard');
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
      },
    );
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
            {...register('password', {
              onChange: () => {
                if (confirmPasswordValue) {
                  void trigger('confirmPassword');
                }
              },
            })}
            type={isPasswordVisible ? 'text' : 'password'}
            id="password"
            placeholder="от 6 до 20 символов"
            autoComplete="new-password"
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

      <div className="auth-form__field">
        <label className="auth-form__label" htmlFor="confirm-password">
          Повторите пароль
        </label>
        <div className="auth-form__input-wrap">
          <input
            className={clsx('auth-form__input', 'auth-form__input--password', {
              'auth-form__input--error': errors.confirmPassword,
            })}
            {...register('confirmPassword', {
              onChange: () => void trigger('confirmPassword'),
            })}
            type={isPasswordConfirmVisible ? 'text' : 'password'}
            id="confirm-password"
            placeholder="Повторите пароль"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
          />
          <button
            title={isPasswordConfirmVisible ? 'Скрыть пароль' : 'Показать пароль'}
            type="button"
            className="auth-form__toggle"
            onClick={() => setPasswordConfirmVisible((prevState) => !prevState)}
          >
            {isPasswordConfirmVisible ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <ErrorMessage message={errors.confirmPassword?.message} className="auth-form__error" />
      </div>

      <div className="auth-form__check-row">
        <Controller
          control={control}
          name="remember"
          render={({ field }) => (
            <Checkbox.Root
              className="auth-form__checkbox"
              id="remember"
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
            >
              <Checkbox.Indicator className="auth-form__checkbox-indicator">
                <Check size={16} strokeWidth={3} />
              </Checkbox.Indicator>
            </Checkbox.Root>
          )}
        />
        <Label.Root className="auth-form__checkbox-label" htmlFor="remember">
          Запомнить меня
        </Label.Root>
      </div>

      <ErrorMessage
        message={errors.root?.message}
        className="auth-form__error auth-form__error--root"
      />

      <button type="submit" className="auth-form__submit" disabled={isPending}>
        {isPending ? '...' : 'Регистрация'}
      </button>

      <div className="auth-form__footer">
        <button type="button" className="auth-form__link">
          Забыли пароль?
        </button>
        <button type="button" className="auth-form__link" onClick={onSwitch}>
          Вход в аккаунт
        </button>
      </div>
    </form>
  );
};
