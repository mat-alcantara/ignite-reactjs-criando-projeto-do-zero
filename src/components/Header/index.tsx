import styles from './header.module.scss';

export const Header: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.contentContainer}>
        <img src="/logo.svg" alt="Logo" />
        <h1 className={styles.headerTitle}>
          spacetraveling<span>.</span>
        </h1>
      </div>
    </div>
  );
};
