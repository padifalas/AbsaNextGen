import authPanelImage from '../assets/auth-panel.png';

export default function AuthPanel() {
  return (
    <div className="login-left">
      <div className="login-left__image">
        <img src={authPanelImage} alt="" aria-hidden="true" />
      </div>
    </div>
  );
}
