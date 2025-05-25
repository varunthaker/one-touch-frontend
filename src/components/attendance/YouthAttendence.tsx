import { youthType } from "../../types";

interface YouthAttendence {
  youth: youthType;
  addSelectedYouth: (youth: youthType) => void;
}

export function YouthAttendence({ youth, addSelectedYouth }: YouthAttendence) {
  return (
    <>
      <div>
        <label htmlFor={youth.firstName}>{`${youth.firstName} ${youth.lastName}`}</label>
        <input
          type="checkbox"
          name={youth.firstName}
          onClick={() => {
            addSelectedYouth(youth);
          }}
        />
      </div>
    </>
  );
}
