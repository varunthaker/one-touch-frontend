import { Table, Button, Row, Col } from "antd";
import { youthType } from "../../types";
import { useState } from "react";
import { YouthInfoForm } from "../forms/youthForm";

interface YouthProps {
  youths: youthType[];
}

const Youths = ({ youths }: YouthProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Define the columns for the table
  const columns = [
    {
      title: "First Name",
      dataIndex: "firstName",
      key: "firstName",
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
      key: "lastName",
    },
    {
      title: "Birthdate",
      dataIndex: "birthdate",
      key: "birthdate",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "WhatsApp Number",
      dataIndex: "whatsAppNumber",
      key: "whatsAppNumber",
    },
    {
      title: "Education in Germany",
      dataIndex: "educationInGermany",
      key: "educationInGermany",
    },
    {
      title: "City in Germany",
      dataIndex: "cityInGermany",
      key: "cityInGermany",
    },
    {
      title: "City in India",
      dataIndex: "cityInIndia",
      key: "cityInIndia",
    },
    {
      title: "Sabha Type",
      dataIndex: "sabhaType",
      key: "sabhaType",
    },
    {
      title: "Reference Person",
      dataIndex: "refNameforSabha",
      key: "refNameforSabha",
    },
    {
      title: "WhatsApp Number Country",
      dataIndex: "whatsAppNumberCountry",
      key: "whatsAppNumberCountry",
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: "16px" }}>
        <Col>
          <h3>Youths</h3>
        </Col>
        <Col>
          <Button type="primary" onClick={() => setIsModalVisible(true)}>
            Add New Youth
          </Button>
        </Col>
      </Row>
      <Table
        virtual
        dataSource={youths}
        columns={columns}
        rowKey="youthId" // Use a unique key for each row
        pagination={false} // Disable pagination for simplicity
        bordered // Add borders to the table
        // scroll={{ x: "fit-content", y: 600 }}
      />
      <YouthInfoForm youth={null} visible={isModalVisible} onClose={() => setIsModalVisible(false)} />
    </div>
  );
};

export default Youths;
