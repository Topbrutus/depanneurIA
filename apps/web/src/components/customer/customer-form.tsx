import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react'
import type { ProfileValidationErrors } from '../../lib/validation'
import { FormError } from './form-error'

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
        <label htmlFor="name">Nom complet *</label>
        <input id="name" name="name" autoComplete="name" value={values.name} onChange={handleChange('name')} placeholder="Prénom Nom" />
        <FormError message={errors?.name} />
      </div>

      <div className="field">
        <label htmlFor="phone">Téléphone *</label>
        <input id="phone" name="phone" autoComplete="tel" value={values.phone} onChange={handleChange('phone')} placeholder="+33 6 00 00 00 00" />
        <FormError message={errors?.phone} />
      </div>

      <div className="field">
        <label htmlFor="deliveryNotes">Notes de livraison (optionnel)</label>
        <textarea
          id="deliveryNotes"
          name="deliveryNotes"
          rows={3}
          value={values.deliveryNotes}
          onChange={handleChange('deliveryNotes')}
          placeholder="Digicode, étage, consignes courtes"
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
