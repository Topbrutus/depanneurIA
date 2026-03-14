import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react'
import type { AddressValidationErrors } from '../../lib/validation'
import { FormError } from './form-error'
import { useI18n } from '../../lib/i18n-context'

export type AddressFormValues = {
  label: string
  line1: string
  line2?: string
  city: string
  postalCode: string
  country?: string
  instructions?: string
  makeDefault?: boolean
}

type AddressFormProps = {
  initialValues?: AddressFormValues
  errors?: AddressValidationErrors
  submitLabel: string
  showDefaultToggle?: boolean
  onSubmit: (values: AddressFormValues) => void
  onChange?: (values: AddressFormValues) => void
}

const defaultValues: AddressFormValues = {
  label: '',
  line1: '',
  line2: '',
  city: '',
  postalCode: '',
  country: 'France',
  instructions: '',
  makeDefault: true,
}

export const AddressForm = ({
  initialValues = defaultValues,
  errors,
  submitLabel,
  showDefaultToggle = true,
  onSubmit,
  onChange,
}: AddressFormProps) => {
  const { t } = useI18n()
  const [values, setValues] = useState<AddressFormValues>(initialValues)

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues])

  const handleChange = (field: keyof AddressFormValues) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.type === 'checkbox' ? (event.target as HTMLInputElement).checked : event.target.value
    const nextValues = { ...values, [field]: value }
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
      <div className="field-row">
        <div className="field">
          <label htmlFor="label">{t('address.label')}</label>
          <input
            id="label"
            name="label"
            value={values.label}
            onChange={handleChange('label')}
            placeholder={t('address.label.placeholder')}
          />
          <FormError message={errors?.label} />
        </div>
        <div className="field">
          <label htmlFor="postalCode">{t('address.postal')}</label>
          <input
            id="postalCode"
            name="postalCode"
            value={values.postalCode}
            onChange={handleChange('postalCode')}
            placeholder={t('address.postal.placeholder')}
          />
          <FormError message={errors?.postalCode} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="line1">{t('address.line1')}</label>
        <input
          id="line1"
          name="line1"
          value={values.line1}
          onChange={handleChange('line1')}
          placeholder={t('address.line1.placeholder')}
        />
        <FormError message={errors?.line1} />
      </div>

      <div className="field">
        <label htmlFor="line2">{t('address.line2')}</label>
        <input
          id="line2"
          name="line2"
          value={values.line2}
          onChange={handleChange('line2')}
          placeholder={t('address.line2.placeholder')}
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="city">{t('address.city')}</label>
          <input id="city" name="city" value={values.city} onChange={handleChange('city')} placeholder={t('address.city.placeholder')} />
          <FormError message={errors?.city} />
        </div>
        <div className="field">
          <label htmlFor="country">{t('address.country')}</label>
          <input
            id="country"
            name="country"
            value={values.country}
            onChange={handleChange('country')}
            placeholder={t('address.country.placeholder')}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="instructions">{t('address.instructions')}</label>
        <textarea
          id="instructions"
          name="instructions"
          rows={3}
          value={values.instructions}
          onChange={handleChange('instructions')}
          placeholder={t('address.instructions.placeholder')}
        />
        <FormError message={errors?.instructions} />
      </div>

      {showDefaultToggle && (
        <label className="checkbox">
          <input type="checkbox" name="makeDefault" checked={Boolean(values.makeDefault)} onChange={handleChange('makeDefault')} />
          <span>{t('address.default.toggle')}</span>
        </label>
      )}

      <FormError message={errors?.base} />

      <button className="btn btn-secondary" type="submit">
        {submitLabel}
      </button>
    </form>
  )
}
