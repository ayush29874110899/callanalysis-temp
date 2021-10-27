import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

export const SentimentChart = ({ data = [], speakerOrder = {} }) => {
  const colours = {
    Agent: "hsl(45, 100%, 50%)",
    Caller: "hsl(202, 100%, 50%)",
  };
  // Find first and last utterances from each speaker

  const firstUtterance = {
    ...Object.keys(speakerOrder).map((speaker) =>
      getFirstUtterance(speaker, data)
    ),
  };

  const lastUtterance = {
    ...Object.keys(speakerOrder).map((speaker) =>
      getLastUtterance(speaker, data)
    ),
  };

  return (
    <Line
      data={{
        labels: data.map((part) => {
          return Math.floor(part.SegmentStartTime);
        }),

        datasets: Object.keys(speakerOrder).map((speaker) => {
          return {
            label: speakerOrder[speaker],
            borderColor: colours[speakerOrder[speaker]],
            fill: false,
            spanGaps: true,
            data: data.map((part, i) => {
              return getPoint(speaker, firstUtterance, lastUtterance, part, i);
            }),
          };
        }),
      }}
      option={options}
    />
  );
};

const options = {
  scales: {
    xAxes: [
      {
        display: false,
      },
    ],
    yAxes: [
      {
        display: true,
      },
    ],
  },
  legend: {
    display: true,
  },
  title: {
    text: "Call Sentiment over time",
    display: true,
    position: "bottom",
  },
};

const getPoint = (speaker, firstUtterance, lastUtterance, part, i) => {
  if (part.SegmentSpeaker !== speaker) {
    return null;
  }

  if (part.SentimentIsPositive) {
    return part.SentimentScore;
  }

  if (part.SentimentIsNegative) {
    return -part.SentimentScore;
  }

  if (i === firstUtterance[speaker] || i === lastUtterance[speaker]) {
    return 0;
  }

  return null;
};

const getFirstUtterance = (speaker, parts) => {
  return parts
    .filter((part) => part.SegmentSpeaker === speaker)
    .reduce(
      (prev, curr) =>
        prev <= curr.SegmentStartTime ? prev : curr.SegmentStartTime,
      parts[0].SegmentStartTime
    );
};
const getLastUtterance = (speaker, parts) => {
  return parts
    .filter((part) => part.SegmentSpeaker === speaker)
    .reduce(
      (prev, curr) =>
        prev >= curr.SegmentStartTime ? prev : curr.SegmentStartTime,
      parts[0].SegmentStartTime
    );
};
