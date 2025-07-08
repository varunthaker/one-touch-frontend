// import Attendance from "./components/attendance/Attendance";
// import Dashboard from "./components/dashboard/Dashboard";
// import Youths from "./components/youths/Youths";
// import Youth from "./components/youths/Youth";
// import Report from "./components/reports/Report";
import "./css/App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Login from "./components/login/Login";
// import Home from "./components/layout/Home";
// import { youthdata } from "./components/assets/dummydata";
// import { youthType } from "./types";
// import { useState } from "react";
import SabhaSelector from "./components/sabhaCenter/SabhaSelector";
// import { YouthInfoForm } from "./components/forms/youthForm";
import { ThemeProvider, createTheme } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import useThemeStore from "./store/useThemeStore";

function App() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  const lightTheme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
  });

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#90caf9',
      },
      secondary: {
        main: '#f48fb1',
      },
    },
  });

  // const [selectedYouthId, setSelectedYouthId] = useState<number | null>(null);

  // const selectedYouth = youthdata?.find((youth: youthType) => youth.youthId === selectedYouthId);

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<SabhaSelector />} />
          <Route path="/layout" element={<Layout />} />
          <Route path="/sabhacenterselector" element={<SabhaSelector />} />
          {/* <Route path="youths" element={<Youths youths={youthdata} selectedYouthId={setSelectedYouthId} />} /> */}
          {/* <Route
              path="/layout/create"
              element={
                <YouthInfoForm
                  youth={{
                    youthId: 0,
                    email: "",
                    firstName: "",
                    lastName: "",
                    birthdate: "",
                    cityInGermany: "",
                    cityInIndia: "",
                    phoneNumber: "",
                    gender: "",
                    education: "",
                    occupation: "",
                    hobbies: "",
                    guardianName: "",
                    guardianContact: "",
                  }}
                />
              }
            /> */}
          {/* <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/youths/:selectedUserId" element={<Youth youth={selectedYouth} />} />
            <Route path="/youths/:selectedUserId/update" element={<YouthInfoForm youth={selectedYouth} />} />
            <Route path="/attendance" element={<Attendance youths={youthdata} />} />
            <Route path="/report" element={<Report />} /> */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
