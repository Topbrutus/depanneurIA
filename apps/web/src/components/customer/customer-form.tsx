import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react'
import type { ProfileValidationErrors } from '../../lib/validation'
import { FormError } from './form-error'
import { useI18n } from '../../lib/i18n-context'

export type CustomerFormValues = {
  name: string
  phone: string
  deliveryNotes?: string
}

type CustomerFormProps = {
  initialValues?: CustomerFormValues
  errors?: ProfileValidationErrors
  submitLabel: string
  onSubmit: (values: CustomerFormValues) => void
  accent?: 'primary' | 'neutral'
  onChange?: (values: CustomerFormValues) => void
}

const defaultValues: CustomerFormValues = {
  name: '',
  phone: '',
  deliveryNotes: '',
}

export const CustomerForm = ({
  initialValues = defaultValues,
  errors,
  submitLabel,
  onSubmit,
  accent = 'primary',
  onChange,
}: CustomerFormProps) => {
  const { translations: t } = useI18n()
  const [values, setValues] = useState<CustomerFormValues>(initialValues)

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues])

  const handleChange = (field: keyof CustomerFormValues) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const nextValues = { ...values, [field]: event.target.value }
    setValues(nextValues)
    onChange?.(nextValues)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit(values)
    onChange?.(values)
  }

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="name">{t.auth.name} *</label>
        <input id="name" name="name" autoComplete="name" value={values.name} onChange={handleChange('name')} placeholder={t.auth.namePlaceholder} />
        <FormError message={errors?.name} />
      </div>

      <div className="field">
        <label htmlFor="phone">{t.auth.phone} *</label>
        <input id="phone" name="phone" autoComplete="tel" value={values.phone} onChange={handleChange('phone')} placeholder={t.auth.phonePlaceholder} />
        <FormError message={errors?.phone} />
      </div>

      <div className="field">
        <label htmlFor="deliveryNotes">{t.auth.deliveryNotes}</label>
        <textarea
          id="deliveryNotes"
          name="deliveryNotes"
          rows={3}
          value={values.deliveryNotes}
          onChange={handleChange('deliveryNotes')}
          placeholder={t.auth.deliveryNotesPlaceholder}
        />
        <FormError message={errors?.deliveryNotes} />
      </div>

      <FormError message={errors?.base} />

      <button className={`btn ${accent === 'neutral' ? 'btn-neutral' : 'btn-primary'}`} type="submit">
        {submitLabel}
      </button>
    </form>
  )
}
