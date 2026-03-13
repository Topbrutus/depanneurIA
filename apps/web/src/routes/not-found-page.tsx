import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <div className="page">
      <div className="card">
        <h2>Page introuvable</h2>
        <p className="muted">La page demandée n’existe pas encore dans ce parcours client V1.</p>
        <div className="cta-row">
          <Link className="btn btn-primary" to="/">
            Retour boutique
          </Link>
          <Link className="btn btn-secondary" to="/signup">
            Créer un profil
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
