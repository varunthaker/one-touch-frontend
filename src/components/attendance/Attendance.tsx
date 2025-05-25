import { Table, Checkbox, Button, DatePicker, message, Input, Form } from "antd";
import { useState, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import { youthType } from "../../types";

interface YouthsAttendence {
  youths: youthType[];
}

interface AttendanceRecord {
  [youthName: string]: "present" | "absent";
}

interface AttendanceByDate {
  [date: string]: {
    attendance: AttendanceRecord;
    sabhaTopic: string;
    sabhaSpeakers: string;
  };
}

const Attendance = ({ youths }: YouthsAttendence) => {
  const [attendanceByDate, setAttendanceByDate] = useState<AttendanceByDate>({});
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [attendance, setAttendance] = useState<AttendanceRecord>({});
  const [sabhaTopic, setSabhaTopic] = useState("");
  const [sabhaSpeakers, setSabhaSpeakers] = useState("");
  const [form] = Form.useForm();

  useEffect(() => {
    const dateKey = selectedDate.format("DD-MM-YYYY");
    if (attendanceByDate[dateKey]) {
      setAttendance(attendanceByDate[dateKey].attendance);
      setSabhaTopic(attendanceByDate[dateKey].sabhaTopic);
      setSabhaSpeakers(attendanceByDate[dateKey].sabhaSpeakers);
      form.setFieldsValue({
        sabhaTopic: attendanceByDate[dateKey].sabhaTopic,
        sabhaSpeakers: attendanceByDate[dateKey].sabhaSpeakers,
      });
    } else {
      const initial: AttendanceRecord = {};
      youths.forEach((y) => (initial[`${y.firstName} ${y.lastName}`] = "absent"));
      setAttendance(initial);
      setSabhaTopic("");
      setSabhaSpeakers("");
      form.resetFields();
    }

    console.log(attendanceByDate);
  }, [selectedDate, youths, attendanceByDate, form]);

  const columns = [
    {
      title: "Youth Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Present",
      dataIndex: "present",
      key: "present",
      render: (_: any, record: { name: string }) => (
        <Checkbox
          checked={attendance[record.name] === "present"}
          onChange={(e) => {
            setAttendance((prev) => ({
              ...prev,
              [record.name]: e.target.checked ? "present" : "absent",
            }));
          }}
        />
      ),
    },
  ];

  const tableData = youths.map((y) => ({
    key: y.youthId,
    name: `${y.firstName} ${y.lastName}`,
  }));

  const disabledDate = (current: Dayjs) => current && current > dayjs().endOf("day");

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const dateKey = selectedDate.format("DD-MM-YYYY");
      setAttendanceByDate((prev) => ({
        ...prev,
        [dateKey]: {
          attendance,
          sabhaTopic: values.sabhaTopic,
          sabhaSpeakers: values.sabhaSpeakers,
        },
      }));
      setSabhaTopic(values.sabhaTopic);
      setSabhaSpeakers(values.sabhaSpeakers);
      message.success("Attendance and Sabha info saved!");
    } catch (error) {
      // Validation failed, do nothing
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-startr",
      }}
    >
      <div>
        <h3>Attendance</h3>
        <div style={{ marginBottom: 16 }}>
          <span style={{ marginRight: 8 }}>Select Sabha Day:</span>
          <DatePicker value={selectedDate} onChange={(date) => date && setSelectedDate(date)} disabledDate={disabledDate} allowClear={false} format="DD-MM-YYYY" />
        </div>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            sabhaTopic,
            sabhaSpeakers,
          }}
          style={{ marginBottom: 16, maxWidth: 400 }}
        >
          <Form.Item label="Sabha Topic" name="sabhaTopic" rules={[{ required: true, message: "Please enter the Sabha Topic" }]}>
            <Input placeholder="Sabha Topic" value={sabhaTopic} onChange={(e) => setSabhaTopic(e.target.value)} />
          </Form.Item>
          <Form.Item label="Sabha Speakers" name="sabhaSpeakers" rules={[{ required: true, message: "Please enter the Speaker" }]}>
            <Input placeholder="Speaker" value={sabhaSpeakers} onChange={(e) => setSabhaSpeakers(e.target.value)} />
          </Form.Item>
        </Form>
        <Table columns={columns} dataSource={tableData} pagination={false} style={{ maxWidth: 400 }} size="middle" />
        <Button type="primary" onClick={handleSave} style={{ marginTop: 16, width: "100%", maxWidth: 400 }}>
          Save Attendance
        </Button>
        {/* <pre>{JSON.stringify(attendanceByDate, null, 2)}</pre> */}
      </div>
    </div>
  );
};

export default Attendance;
