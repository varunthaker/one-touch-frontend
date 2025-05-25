import { E164Number } from "libphonenumber-js/core";
import { useState } from "react";
import { Modal, Button, Form, Input, Checkbox, Radio, Select, DatePicker } from "antd";
// import PhoneInput from "react-phone-number-input";
import format from "date-fns/format";
import { youthType } from "../../types";
import dayjs from "dayjs";

interface YouthInfoFormProps {
  youth: youthType | null;
  visible: boolean;
  onClose: () => void;
}

export function YouthInfoForm({ youth, visible, onClose }: YouthInfoFormProps) {
  const [selectedSabha, setSelectedSabha] = useState<string | null>(youth?.sabhaType || null);
  const [phoneNumber, setPhoneNumber] = useState<E164Number | string>("");
  const [phoneSameAsWhatsApp, setPhoneSameAsWhatsApp] = useState<boolean>(false);
  const [whatsAppNumber, setWhatsAppNumber] = useState<E164Number | string>("");

  const countryCodes = [
    { label: "+49", value: "+49" },
    { label: "+91", value: "+91" },
    { label: "+48", value: "+48" },
    { label: "+420", value: "+420" },
    { label: "+351", value: "+351" },
  ];

  // Handle Form Submission
  async function handleSubmit(values: any) {
    console.log("Form Submitted:", values);

    let method = "POST";
    let requestURL = "/youths";

    if (youth) {
      method = "PUT";
      requestURL = `/youths/${youth.youthId}`;
    }

    // Backend Post method
    const response = await fetch(requestURL, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    if (response.ok) {
      console.log("Youth saved successfully!");
      onClose(); // Close the modal after successful submission
    } else {
      console.error(`Error: ${response}`);
    }
  }

  return (
    <Modal
      title={"Add Youth"}
      open={visible}
      onCancel={onClose}
      footer={null} // Remove default footer buttons
      centered
      width="60%" // Set custom width
      style={{
        top: 20, // Add distance from the top
        height: "80vh", // Set custom height
        overflowY: "auto", // Enable scrolling if content overflows
      }}
    >
      <Form
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          firstName: youth?.firstName || "",
          lastName: youth?.lastName || "",
          email: youth?.email || "",
          birthdate: youth?.birthdate ? format(youth.birthdate, "yyyy-MM-dd") : "",
          phoneNumber: youth?.phoneNumber || "",
          whatsAppNumber: youth?.whatsAppNumber || "",
          cityInGermany: youth?.cityInGermany || "",
          cityInIndia: youth?.cityInIndia || "",
          educationInGermany: youth?.educationInGermany || "",
          refNameforSabha: youth?.refNameforSabha || "",
          sabhaType: youth?.sabhaType || "",
        }}
      >
        <Form.Item label="First Name" name="firstName" rules={[{ required: true, message: "Please enter the first name" }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Last Name" name="lastName" rules={[{ required: true, message: "Please enter the last name" }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Email" name="email" rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Birthdate" name="birthdate" rules={[{ required: true, message: "Please select a birthdate" }]}>
          <DatePicker
            format="DD-MM-YYYY" // Specify the date format
            style={{ width: "100%" }} // Make the DatePicker full width
            defaultValue={youth?.birthdate ? dayjs(youth.birthdate, "DD-MM-YYYY") : undefined}
          />
        </Form.Item>
        <Form.Item
          label="Phone Number"
          name="phoneNumber"
          rules={[
            { required: true, message: "Please enter a phone number" },
            { pattern: /^[0-9]+$/, message: "Phone number must contain only numbers" }, // Validation for numeric input
          ]}
        >
          <Input
            addonBefore={<Select defaultValue="+49" options={countryCodes} style={{ width: 80 }} onChange={(value) => console.log("Selected country code:", value)} />}
            placeholder="Enter phone number"
          />
        </Form.Item>
        <Form.Item>
          <Checkbox
            checked={phoneSameAsWhatsApp}
            onChange={(e) => {
              setPhoneSameAsWhatsApp(e.target.checked);
              if (e.target.checked) {
                setWhatsAppNumber(phoneNumber);
              }
            }}
          >
            WhatsApp is the same as the given phone number
          </Checkbox>
        </Form.Item>

        {!phoneSameAsWhatsApp && (
          <Form.Item
            label="WhatsApp Number"
            name="whatsAppNumber"
            rules={[
              { required: false, message: "Please enter a phone number" },
              { pattern: /^[0-9]+$/, message: "Phone number must contain only numbers" }, // Validation for numeric input
            ]}
          >
            <Input
              addonBefore={<Select defaultValue="+49" options={countryCodes} style={{ width: 80 }} onChange={(value) => console.log("Selected WhatsApp country code:", value)} />}
              placeholder="Enter WhatsApp number"
            />
          </Form.Item>
        )}
        <Form.Item label="City in Germany" name="cityInGermany" rules={[{ required: true, message: "Please enter a city in Germany" }]}>
          <Input />
        </Form.Item>
        <Form.Item label="City in India" name="cityInIndia" rules={[{ required: true, message: "Please enter a city in India" }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Education/Work in Germany" name="educationInGermany" rules={[{ required: true, message: "Please enter education/work details" }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Reference Name" name="refNameforSabha" rules={[{ required: true, message: "Please enter a reference name" }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Which Sabha do you attend" name="sabhaType">
          <Radio.Group onChange={(e) => setSelectedSabha(e.target.value)} value={selectedSabha}>
            <Radio value="Thursday">Thursday</Radio>
            <Radio value="Friday">Friday</Radio>
            <Radio value="Thursday and Friday">Thursday and Friday</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            {youth ? "Update" : "Create"}
          </Button>
          <Button style={{ marginLeft: "8px" }} onClick={onClose}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
