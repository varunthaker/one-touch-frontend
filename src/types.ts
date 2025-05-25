import { E164Number } from "libphonenumber-js/core";

export interface youthType {
  youthId: number;
  email: string;
  firstName: string;
  lastName: string;
  birthdate: Date;
  cityInGermany: string;
  cityInIndia: string;
  phoneNumber: E164Number;
  whatsAppNumber: E164Number;
  educationInGermany: string;
  refNameforSabha: string;
  sabhaType: string;
  youthImage: string;
  whatsAppNumberCountry: string;
}

export interface sabhaType {
  title: string;
  date: Date;
  topic: string;
  speaker: {
    speakerOne: string;
    speakerTwo: string;
  };
}
