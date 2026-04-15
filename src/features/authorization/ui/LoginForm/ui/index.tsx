import { zodResolver } from '@hookform/resolvers/zod';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Label from '@radix-ui/react-label';
import type { AxiosError } from 'axios';
import { ArrowRight, Check, Eye, EyeOff } from 'lucide-react';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { useLoginUser } from '@/features/authorization';
import type { ErrorResponse } from '@/shared/types';
import { Button } from '@/shared/ui/Button';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';

import type { AuthFormProps } from '../../RegForm';

import '../../styles/auth-form.scss';
import './login-form.scss';

const LoginSchema = z.object({
  login: z
    .string()
    .min(5, 'Ваш логин не может быть короче 5-ти символов!')
    .max(30, 'Ваш логин не может быть длиннее 30-ти символов!'),
  password: z.string().min(8, 'Пароль должен быть не короче 8-ми символов!'),
  remember: z.boolean(),
});

type LoginFormValue = z.infer<typeof LoginSchema>;

export const LoginForm = ({ onSwitch, onClose }: AuthFormProps) => {
  const {
    register, // привязывает поле к форме
    handleSubmit, // обёртка onSubmit с валидацией
    formState: { errors },
    setError,
    reset, // сброс формы
    control,
  } = useForm<LoginFormValue>({
    resolver: zodResolver(LoginSchema), // zod как валидатор
    defaultValues: {
      remember: true,
    },
  });

  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const { mutate, isPending } = useLoginUser();

  const formRef = useRef<HTMLFormElement>(null);
  //ПОКА запомнить меня НЕ РАБОТАЕТ - РЕЗУЛЬТАТ С ГАЛОЧКИ НЕ ОТПРАВЛЯЕТСЯ (реализовать на бэке это надо)
  //как только бэк будет ждать поле remember - убрать его из игнор-значений (след. строка)
  const onSubmit = ({ remember: _, ...data }: LoginFormValue) => {
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
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="form">
      <div className="form__form-element">
        <label className="form__form-element__label" htmlFor="login">
          Логин
        </label>
        <input
          className="form__form-element__input"
          {...register('login')}
          type="text"
          id="login"
          placeholder="ivandopulo_kipriansky"
          autoCapitalize="none"
        />
        <ErrorMessage message={errors.login?.message} />
      </div>
      <div className="form__form-element">
        <label className="form__form-element__label" htmlFor="password">
          Пароль
        </label>
        <div className="password-div">
          <input
            className="form__form-element__input"
            {...register('password')}
            type={isPasswordVisible ? 'text' : 'password'}
            id="password"
            placeholder="Создайте пароль"
          />
          <button
            title={isPasswordVisible ? 'Скрыть пароль' : 'Показать пароль'}
            type="button"
            className="password-eye"
            onClick={() => setPasswordVisible((prevState) => !prevState)}
          >
            {isPasswordVisible ? <EyeOff /> : <Eye />}
          </button>
        </div>
        <ErrorMessage message={errors.password?.message} />
      </div>
      <div className="form__form-element checkbox-field">
        <Controller
          control={control}
          name="remember"
          render={({ field }) => (
            <Checkbox.Root
              className="checkbox"
              id="remember"
              checked={!field.value}
              onCheckedChange={(checked) => field.onChange(!checked)}
            >
              <Checkbox.Indicator className="checkbox__indicator">
                <Check size={24} strokeWidth={3} />
              </Checkbox.Indicator>
            </Checkbox.Root>
          )}
        />
        <Label.Root className="placeholder label-rem" htmlFor="remember">
          Не запоминать меня
        </Label.Root>
      </div>
      <div className="button-acc">
        <Button type="submit" variant="primary" disabled={isPending}>
          <div className="button-child">
            {isPending ? 'Загрузка...' : 'Войти'}
            <ArrowRight />
          </div>
        </Button>

        <div className="placeholder acc-text">
          Нет аккаунта?{' '}
          <button className="acc-text__button" onClick={onSwitch}>
            Зарегистрироваться
          </button>
        </div>
        <ErrorMessage message={errors.root?.message} className="error-root" />
      </div>
    </form>
  );
};
