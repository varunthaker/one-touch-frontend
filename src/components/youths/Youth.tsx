import { Fragment } from "react";
import { youthType } from "../../types";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface SingleYouthProp {
  youth: youthType;
}

const Youth = ({ youth }: SingleYouthProp) => {
  const { youthId, firstName, lastName, youthImage, phoneNumber, birthdate, email, whatsAppNumber, cityInGermany, cityInIndia, sabhaType, refNameforSabha } = youth;
  const navigate = useNavigate();

  return (
    <Fragment>
      <div>
        <button type="button" onClick={() => navigate("/youths", { replace: true })}>
          X
        </button>
        <button type="button" onClick={() => navigate(`/youths/${youthId}/update`, { replace: true })}>
          Edit
        </button>
        <p>Name: {`${firstName} ${lastName}`}</p>
        <img src={youthImage} alt="youthImage" style={{ width: "50px", height: "50px" }} />
        <p>{format(birthdate, "dd-MM-yyyy")}</p>
        <a href={`tel:${phoneNumber}`}>Call</a> <br />
        <a href={`mailto:${email}`}>E-mail</a> <br />
        <a href={`//api.whatsapp.com/send?phone=${whatsAppNumber}&text=test`}>WhatsApp</a>
        <p>
          City in Germany: <b>{cityInGermany}</b>{" "}
        </p>
        <p>
          City in India: <b>{cityInIndia}</b>
        </p>
        <p>Sabha: {sabhaType}</p>
        <p>Followup: {refNameforSabha}</p>
      </div>
    </Fragment>
  );
};

export default Youth;
