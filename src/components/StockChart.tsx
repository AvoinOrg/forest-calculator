import * as React from "react";
import * as Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Theme } from "../styles";

const getOptions = (data, colNames): Highcharts.Options => {
  return {
    title: {
      text: ""
    },

    xAxis: {
      categories: colNames,
      labels: {
        style: {
          color: Theme.color.white,
          opacity: 0.6
        }
      },
      lineColor: "rgba(221, 207, 162, 0.1)"
    },


    yAxis: {
      title: {
        text: "tonnia CO2-ekv / ha / v",
        style: {
          color: Theme.color.white,
          opacity: 0.6
        }
      },
      gridLineColor: "rgba(221, 207, 162, 0.3)",
      lineColor: Theme.color.white,
      labels: {
        style: {
          color: Theme.color.white,
          opacity: 0.6
        }
      }
    },

    legend: {
      align: "right",
      x: 0,
      verticalAlign: "top",
      y: 0,
      backgroundColor: "none",
      borderColor: "none",
      borderWidth: 1,
      shadow: false,
      layout: "vertical",
      itemStyle: {
        color: Theme.color.white
      }
    },

    tooltip: {
      enabled: false,
    },

    plotOptions: {
      column: {
        stacking: "normal",
        dataLabels: {
          enabled: false
        }
      }
    },

    chart: {
      backgroundColor: "none",
      plotBorderWidth: 0,
      plotBorderColor: "black",
      borderWidth: 0,
      height: 250,
      width: 350
    },
    credits: {
      enabled: false
    },

    series: [
      {
        type: "column",
        showInLegend: false,
        legendIndex: 0,
        data: [data.item, data.comparison && data.comparison],
        borderWidth: 0,
        color: Theme.color.secondary
      }
    ]
  };
};

const StockChart = (props: { data; colNames }) => {
  const shownData = {
    item: props.data.item
  };
  if (props.data.comparison) {
    shownData["comparison"] = props.data.comparison;
  }

  return (
    <div>
      <HighchartsReact
        highcharts={Highcharts}
        options={getOptions(shownData, props.colNames)}
      />
    </div>
  );
};

export default StockChart;
