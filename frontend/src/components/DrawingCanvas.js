import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';

export default function DrawingCanvas({ selectedTool, showAnnotations }) {
  const canvasRef = useRef(null);
  const [shapes, setShapes] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState(null);
  const [selectedShapeIndex, setSelectedShapeIndex] = useState(null);
  const [dragOffset, setDragOffset] = useState(null);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const fetchShapes = async () => {
      try {
        const res = await axios.get('https://building-planner-vs8p.onrender.com/shapes');
        setShapes(res.data);
      } catch (err) {
        console.error("Error fetching shapes:", err);
      }
    };
    fetchShapes();
  }, []);

  useEffect(() => {
    redrawCanvas();
  }, [shapes, selectedShapeIndex, currentShape, showAnnotations]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    shapes.forEach((shape, index) => {
      drawShape(ctx, shape, index === selectedShapeIndex, showAnnotations);
    });

    if (currentShape) {
      drawShape(ctx, currentShape, false, showAnnotations, true);
    }
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedTool === 'select') {
      const idx = shapes.findIndex(s => isInsideShape(x, y, s));
      if (idx !== -1) {
        const s = shapes[idx];
        setSelectedShapeIndex(idx);
        if (isOnResizeHandle(x, y, s)) {
          setIsResizing(true);
        } else {
          setDragOffset({ dx: x - s.startX, dy: y - s.startY });
        }
      } else {
        setSelectedShapeIndex(null);
      }
      return;
    }

    setCurrentShape({
      type: selectedTool,
      startX: x,
      startY: y,
      endX: x,
      endY: y
    });
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDrawing && currentShape) {
      setCurrentShape({ ...currentShape, endX: x, endY: y });
    } else if (selectedTool === 'select' && selectedShapeIndex !== null) {
      const newShapes = [...shapes];
      const s = { ...newShapes[selectedShapeIndex] };

      if (isResizing) {
        s.endX = x;
        s.endY = y;
      } else if (dragOffset) {
        const width = s.endX - s.startX;
        const height = s.endY - s.startY;
        s.startX = x - dragOffset.dx;
        s.startY = y - dragOffset.dy;
        s.endX = s.startX + width;
        s.endY = s.startY + height;
      }

      newShapes[selectedShapeIndex] = s;
      setShapes(newShapes);
    }
  };

  const handleMouseUp = async () => {
    if (currentShape) {
      const newShapes = [...shapes, currentShape];
      setShapes(newShapes);
      try {
        await axios.post('https://building-planner-vs8p.onrender.com/shapes', currentShape);
      } catch (err) {
        console.error("Error saving shape:", err);
      }
      setIsDrawing(false);
      setCurrentShape(null);
    }
    setDragOffset(null);
    setIsResizing(false);
  };

  const drawShape = (ctx, shape, selected = false, annotate = true, isPreview = false) => {
    const { type, startX, startY, endX, endY } = shape;

    ctx.beginPath();
    ctx.strokeStyle = selected ? 'red' : isPreview ? '#999' : 'black';

    if (type === 'line') {
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
    } else if (type === 'rectangle') {
      ctx.rect(startX, startY, endX - startX, endY - startY);
    } else if (type === 'circle') {
      const radius = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
      ctx.arc(startX, startY, radius, 0, Math.PI * 2);
    }

    ctx.stroke();

    // Resize handle
    if (selected && !isPreview) {
      ctx.fillStyle = 'green';
      ctx.fillRect(endX - 10, endY - 10, 10, 10);
    }

    // Annotation
    if (annotate && !isPreview) {
      ctx.font = '12px Arial';
      ctx.fillStyle = 'blue';
      const length = Math.round(Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2));
      ctx.fillText(`${type} (${length}px)`, startX + 5, startY - 5);
    }
  };

  const isInsideShape = (x, y, shape) => {
    const { startX, startY, endX, endY, type } = shape;

    if (type === 'rectangle') {
      return x >= Math.min(startX, endX) && x <= Math.max(startX, endX) &&
             y >= Math.min(startY, endY) && y <= Math.max(startY, endY);
    } else if (type === 'circle') {
      const r = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
      return (x - startX) ** 2 + (y - startY) ** 2 <= r ** 2;
    } else if (type === 'line') {
      const dist = Math.abs((endY - startY) * x - (endX - startX) * y + endX * startY - endY * startX)
        / Math.sqrt((endY - startY) ** 2 + (endX - startX) ** 2);
      return dist <= 5;
    }

    return false;
  };

  const isOnResizeHandle = (x, y, shape) => {
    const { endX, endY } = shape;
    const size = 10;
    return x >= endX - size && x <= endX && y >= endY - size && y <= endY;
  };

  const handleKeyDown = async (e) => {
    if (e.key === 'Delete' && selectedShapeIndex !== null) {
      const shapeToDelete = shapes[selectedShapeIndex];
      const updatedShapes = shapes.filter((_, i) => i !== selectedShapeIndex);
      setShapes(updatedShapes);
      setSelectedShapeIndex(null);
      try {
        await axios.delete(`https://building-planner-vs8p.onrender.com/shapes/${shapeToDelete._id}`);
      } catch (err) {
        console.error("Error deleting shape:", err);
      }
    }
  };


  return (
    <canvas
      ref={canvasRef}
      width={1000}
      height={600}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ outline: 'none', border: '1px solid #333', background: '#fff' }}
    />
  );
}
