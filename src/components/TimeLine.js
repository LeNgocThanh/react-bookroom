import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const TimeLine = () => {
  const containerRef = useRef();
  const svgRef = useRef();
  const width = 1170;  

  useEffect(() => {
    if (width === 0) return;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', 100);

    const xScale = d3.scaleLinear()
      .domain([0, 24])
      .range([0, width]);

    const xAxis = d3.axisBottom(xScale)
      .tickValues([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24])
      .tickFormat(d => `${d}h`);

    svg.selectAll('*').remove(); // Clear previous axis
    svg.append('g')
      .attr('transform', 'translate(0, 50)')
      .call(xAxis);
  }, [width]);

  return (
    <div ref={containerRef} style={{ width: width }}>
      <svg ref={svgRef} style={{ width: width }}></svg>
    </div>
  );
};

const TimeLine2day = () => {
  const containerRef = useRef();
  const svgRef = useRef();
  const width = 2340;

  

  useEffect(() => {
    if (width === 0) return;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', 100);

    const xScale = d3.scaleLinear()
      .domain([0, 48])
      .range([0, width]);

    const xAxis = d3.axisBottom(xScale)
      .tickValues([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48])
      .tickFormat(d => `${d % 24}h`);

    svg.selectAll('*').remove(); // Clear previous axis
    svg.append('g')
      .attr('transform', 'translate(0, 50)')
      .call(xAxis);
  }, [width]);

  return (
    <div ref={containerRef} style={{ width: width }}>
      <svg ref={svgRef} style={{ width: width }}></svg>
    </div>
  );
};


const TimeLine3day = () => {
  const containerRef = useRef();
  const svgRef = useRef();
  const width = 3510;
  

  useEffect(() => {
    if (width === 0) return;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', 100);

    const xScale = d3.scaleLinear()
      .domain([0, 72])
      .range([0, width]);

    const xAxis = d3.axisBottom(xScale)
      .tickValues([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72])
      .tickFormat(d => `${d % 24}h`);

    svg.selectAll('*').remove(); // Clear previous axis
    svg.append('g')
      .attr('transform', 'translate(0, 50)')
      .call(xAxis);
  }, [width]);

  return (
    <div ref={containerRef} style={{ width: width }}>
      <svg ref={svgRef} style={{ width: width }}></svg>
    </div>
  );
};

export { TimeLine, TimeLine2day, TimeLine3day };