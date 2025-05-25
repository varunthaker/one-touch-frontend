import { Tabs } from "antd";
import Dashboard from "./dashboard/Dashboard";
import Youths from "./youths/Youths";
import Attendance from "./attendance/Attendance";
import Report from "./reports/Report";
import { youthdata } from "./assets/dummydata";
import "./navbar.css";

const Layout = () => {
  const tabItems = [
    { label: "Dashboard", key: "1", children: <Dashboard /> },
    { label: "Youths", key: "2", children: <Youths youths={youthdata} selectedYouthId={(id: number) => console.log(id)} /> },
    { label: "Attendance", key: "3", children: <Attendance youths={youthdata} /> },
    { label: "Report", key: "4", children: <Report /> },
  ];

  return (
    <div className="tabs-container">
      <Tabs defaultActiveKey="1" centered={false} type="card" items={tabItems} size="small"></Tabs>
    </div>
  );
};

export default Layout;
