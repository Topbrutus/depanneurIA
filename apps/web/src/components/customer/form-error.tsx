type FormErrorProps = {
  message?: string
}

export const FormError = ({ message }: FormErrorProps) => {
  if (!message) return null
  return (
    <div className="form-error" role="alert">
      {message}
    </div>
  )
}
