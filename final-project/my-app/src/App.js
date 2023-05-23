import logo from './logo.svg';
import './App.css';
import PlotMap from './PlotMap';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
    <div className="App">
      {/* <header className="App-header"> */}
      <PlotMap />
      {/* </header> */}
    </div>
    </ThemeProvider>
  );
}

export default App;

