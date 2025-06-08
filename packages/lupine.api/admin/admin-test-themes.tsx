import { CssProps, darkThemes, lightThemes } from 'lupine.components';

const TestThemes = () => {
  const lightNames = Object.keys(lightThemes);
  const css: CssProps = {
    '.theme-title': {
      width: '200px',
    },
    '.theme-item1': {
      width: '10%',
    },
    '.theme-item2': {
      width: '10%',
    },
    '.theme-item3': {
      width: '10%',
    },
    '.theme-item4': {
      width: '10%',
    },
  };
  return (
    <div css={css}>
      <div class='row-box mb-s'>
        <div class='theme-title bold mb-s'>Theme attributes</div>
        <div class='theme-item1 mb-s'>Light</div>
        <div class='theme-item2 mb-s'></div>
        <div class='theme-item3 mb-s'>Dark</div>
        <div class='theme-item4 mb-s'></div>
      </div>

      {lightNames.map((themeName) => (
        <div key={themeName} class='row-box mb-s'>
          <div class='theme-title bold mb-s'>{themeName}</div>
          <div class='theme-item1 mb-s' style={{ color: lightThemes[themeName] }}>
            {lightThemes[themeName]}
          </div>
          <div class='theme-item2 mb-s' style={{ background: lightThemes[themeName] }}>
            {lightThemes[themeName]}
          </div>

          <div class='theme-item3 mb-s' style={{ color: darkThemes[themeName] }}>
            {darkThemes[themeName]}
          </div>
          <div class='theme-item4 mb-s' style={{ background: darkThemes[themeName] }}>
            {darkThemes[themeName]}
          </div>
        </div>
      ))}
    </div>
  );
};

export const TestThemesPage = () => {
  return <TestThemes />;
};
