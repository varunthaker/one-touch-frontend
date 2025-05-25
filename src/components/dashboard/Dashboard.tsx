import { Card, Collapse, Row, Col } from "antd";
import { youthType, sabhaType } from "../../types";
import { youthdata } from "../assets/dummydata";
import { sabhaData } from "../assets/dummydata";
import { startOfWeek, endOfWeek, isWithinInterval, format } from "date-fns";

const { Panel } = Collapse;

const todayDate: Date = new Date();
const startOfTheWeekDate = startOfWeek(todayDate);
const endOfTheWeekDate = endOfWeek(todayDate);
const todayInString = format(todayDate, "dd-MM-yyyy");

const youthsWithBirthdayThisWeek = youthdata.filter((youth: youthType) => {
  const userBirthDate = youth.birthdate;
  return isWithinInterval(userBirthDate, {
    start: startOfTheWeekDate,
    end: endOfTheWeekDate,
  });
});

function Dashboard() {
  return (
    <div style={{ padding: "20px" }}>
      <h3>Dashboard</h3>

      <Row gutter={[16, 16]}>
        {/* Birthdays Section */}
        <Col xs={24} sm={12} lg={12}>
          <Card title="Birthdays This Week" hoverable>
            <Collapse>
              {youthsWithBirthdayThisWeek.map((youth: youthType) => {
                const youthBirthdayToday = format(youth.birthdate, "dd-MM-yyyy");
                return (
                  <Panel header={youthBirthdayToday === todayInString ? `🎉 Today: ${youth.firstName} ${youth.lastName}` : `${youth.firstName} ${youth.lastName}`} key={youth.youthId}>
                    <p>Birthday: {youthBirthdayToday}</p>
                  </Panel>
                );
              })}
            </Collapse>
          </Card>
        </Col>

        {/* Upcoming Events Section */}
        <Col xs={24} sm={12} lg={12}>
          <Card title="Upcoming Events" hoverable>
            <Collapse accordion>
              {sabhaData.map((sabha: sabhaType, index: number) => (
                <Panel header={`${sabha.title}: ${sabha.topic}`} key={index}>
                  <p>Date: {format(sabha.date, "dd-MM-yyyy")}</p>
                  <p>Topic: {sabha.topic}</p>
                  <h5>Speaker(s):</h5>
                  <p>{sabha.speaker.speakerOne}</p>
                  <p>{sabha.speaker.speakerTwo}</p>
                </Panel>
              ))}
            </Collapse>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
