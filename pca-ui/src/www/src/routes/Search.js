import { useState } from "react";
import Container from "react-bootstrap/Container";
import FormText from "react-bootstrap/esm/FormText";
import Form from "react-bootstrap/Form";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

import { entities as getEntities, languages as getLanguages } from "../api/api";

function Search() {
  const [entities, setEntities] = useState([]);
  const [languageCodes, setLanguageCodes] = useState([]);
  const [startDate, setStartDate] = useState(new Date());

  const [error, setError] = useState();
  const [loading, setLoading] = useState(true);

  useState(() => {
    const getData = async () => {
      try {
        const e = await getEntities();
        setEntities(e);

        const l = await getLanguages();
        setLanguageCodes(l);
      } catch (err) {
        console.log(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  return (
    <Container>
      <h3>Search</h3>
      <Form>
        <Form.Group>
          <Form.Label>Language Code</Form.Label>
          <Form.Select>
            {languageCodes.map((code) => (
              <option>{code}</option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group>
          <Form.Label>Date Range</Form.Label>
          <FormText>From</FormText>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="yyyy-MM-dd"
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Sentiment</Form.Label>
          <Form.Control />
          <Form.Text></Form.Text>
        </Form.Group>
        <Form.Group>
          <Form.Label>Entities</Form.Label>
          <Form.Select>
            {entities.map((entity) => (
              <option>{entity}</option>
            ))}
          </Form.Select>
          <Form.Text></Form.Text>
        </Form.Group>
      </Form>
    </Container>
  );
}

export default Search;
