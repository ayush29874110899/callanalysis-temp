import { useEffect, useState } from "react";
import useSWR from "swr";
import { Button, Form } from "react-bootstrap";
import DatePicker from "react-datepicker";
import {
  entities as getEntities,
  languages as getLanguages,
  search,
} from "../api/api";
import { ContactTable } from "../components/ContactTable";
import { useDangerAlert } from "../hooks/useAlert";
import { MultiSelect } from "../components/MultiSelect";
import { Select } from "../components/Select";

function Search({ setAlert }) {
  const [editing, setEditing] = useState(true);
  const [query, setQuery] = useState({});
  const [shouldSearch, setShouldSearch] = useState(true);

  useEffect(() => {
    (query.timestampTo && query.timestampTo) ||
    (!query.timestampTo && !query.timestampFrom)
      ? setShouldSearch(true)
      : setShouldSearch(false);
  }, [query.timestampTo, query.timestampFrom]);

  const { data: entities, error: errorEntities } = useSWR(
    `/entities`,
    getEntities
  );
  const { data: languageCodes, error: errorLanguageCodes } = useSWR(
    `/languages`,
    getLanguages
  );
  const { data: results, error: errorResults } = useSWR(
    shouldSearch ? [`/search`, query] : null,
    () => search(query)
  );

  const handleDates = (dates) => {
    const [start, end] = dates;

    handleQueryInput(new Date(start).getTime(), "timestampFrom");
    handleQueryInput(new Date(end).getTime(), "timestampTo");
  };

  const filterEmptyKeys = (obj) => {
    const shouldKeep = (v) => (Array.isArray(v) ? v.length > 0 : v !== null);

    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => shouldKeep(v))
    );
  };

  const handleQueryInput = (input, field) =>
    setQuery((q) => filterEmptyKeys({ ...q, [field]: input }));

  const onClick = () => {
    setEditing(false);
  };

  useDangerAlert(errorEntities || errorLanguageCodes || errorResults, setAlert);

  return (
    <>
      <h3>Search</h3>
      <Form className="mb-5">
        <Form.Group className="mb-3">
          <Form.Label>
            <h5>Language Code</h5>
          </Form.Label>
          <Select
            onChange={(event) => handleQueryInput(event.value, "language")}
            options={(languageCodes || []).map((code, i) => ({
              label: code,
              value: code,
            }))}
            isLoading={!languageCodes && !errorLanguageCodes}
            isClearable={true}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>
            <h5>Date Range</h5>
          </Form.Label>
          <DatePicker
            selectsRange
            startDate={query.timestampFrom}
            endDate={query.timestampTo}
            dateFormat="yyyy-MM-dd"
            onChange={handleDates}
            maxDate={new Date()}
            placeholderText="Select a start and end date"
          />
          <Button
            className="mt-2"
            variant="outline-secondary"
            onClick={() => {
              handleQueryInput(null, "timestampTo");
              handleQueryInput(null, "timestampFrom");
            }}
          >
            Clear
          </Button>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>
            <h5>Sentiment</h5>
          </Form.Label>
          <div className="d-flex  gap-2 mb-3 ">
            <p>The sentiment</p>
            <Select
              className="flex-grow-1"
              options={["Average", "Trend"].map((o) => ({
                label: o,
                value: o.toLowerCase(),
              }))}
              onChange={(value) => handleQueryInput(value, "sentimentWhat")}
              value={query.sentimentWhat}
              isClearable={true}
            />
            <p>of the</p>
            <Select
              className="flex-grow-1"
              options={["Agent", "Caller"].map((o) => ({
                label: o,
                value: o.toLowerCase(),
              }))}
              onChange={(value) => handleQueryInput(value, "sentimentWho")}
              value={query.sentimentWho}
              isClearable={true}
            />
            <p>is</p>
            <Select
              className="flex-grow-1"
              options={["Positive", "Negative"].map((o) => ({
                label: o,
                value: o.toLowerCase(),
              }))}
              onChange={(value) =>
                handleQueryInput(value, "sentimentDirection")
              }
              value={query.sentimentDirection}
            />
          </div>
          <Button
            variant="outline-secondary"
            onClick={() => {
              handleQueryInput(null, "sentimentWhat");
              handleQueryInput(null, "sentimentWho");
              handleQueryInput(null, "sentimentDirection");
            }}
          >
            Clear
          </Button>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>
            <h5>Entities</h5>
          </Form.Label>
          <MultiSelect
            options={(entities || []).map((entity) => ({
              value: entity,
              label: entity,
            }))}
            onChange={(value) => handleQueryInput(value, "entity")}
            isLoading={!entities && !errorEntities}
          />
        </Form.Group>
        <Button bg={"primary"} onClick={onClick}>
          Search
        </Button>
      </Form>

      {!editing && (
        <ContactTable
          data={results}
          loading={!results && !errorResults}
          empty={<NoMatches />}
        />
      )}
    </>
  );
}
const NoMatches = () => (
  <div>
    <h2>No Matches</h2>
    <p>Please try a different query</p>
  </div>
);

const RadioInput = ({ label, onChange, name, choices = [] }) => (
  <Form.Group className="mb-3">
    <Form.Label className="me-3">
      <h5>{label}</h5>
    </Form.Label>
    {choices.map((c, i) => (
      <Form.Check
        key={i}
        onChange={onChange}
        name={name}
        label={c.label}
        type="radio"
        value={c.value}
        inline
      />
    ))}
    <Form.Text></Form.Text>
  </Form.Group>
);

export default Search;
