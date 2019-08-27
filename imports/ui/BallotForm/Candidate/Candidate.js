import React, { useEffect, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';

const ItemTypes = {
  CANDIDATE: 'candidate',
};

export const Candidate = React.forwardRef(({
  candidate,
  max,
  min,
  onChangeCandidateRankInput,
  value,
}, ref) => {
  const [candidateRankInputValue, setCandidateRankInputValue] = useState(value);
  const [arrowingDown, setArrowingDown] = useState(false);
  const [arrowingUp, setArrowingUp] = useState(false);

  useEffect(() => {
    setCandidateRankInputValue(value);
  }, [value]);

  const onChange = event => {
    const nextValue = event.target.value;

    if (
      arrowingUp || arrowingDown || // Don't conflict with keyboard number incrementing
      (nextValue !== '' && (nextValue < min || nextValue > max)) // Bail on out-of-bound numbers
    ) {
      return;
    }

    // Locally controlled version (tolerant of empty values)
    setCandidateRankInputValue(nextValue);

    // Bubble change to parent (must be a valid value)
    if (nextValue) {
      onChangeCandidateRankInput(nextValue); // Parent uses 0-indexed array
    }
  }

  const onKeyDownCandidateRank = event => {
    switch(event.key) {
      case 'ArrowUp':
        setArrowingUp(true);
        break;
      case 'ArrowDown':
        setArrowingDown(true);
        break;
      default:
        break;
    }
  }

  const onKeyUpCandidateRank = event => {
    const prevValue = value;
    let nextValue;

    switch(event.key) {
      case 'ArrowUp':
        setArrowingUp(false);
        nextValue = Math.max(prevValue - 1, min);
        break;
      case 'ArrowDown':
        setArrowingDown(false);
        nextValue = Math.min(prevValue + 1, max);
        break;
      default:
        break;
    }

    if (nextValue) {
      onChangeCandidateRankInput(nextValue);
    }
  }

  const onClickCandidateRankUp = event => {
    const prevValue = value;
    const nextValue = Math.max(prevValue - 1, min);

    if (nextValue) {
      onChangeCandidateRankInput(nextValue);
    }
  };

  const onClickCandidateRankDown = event => {
    const prevValue = value;
    const nextValue = Math.min(prevValue + 1, max);

    if (nextValue) {
      onChangeCandidateRankInput(nextValue);
    }
  };

  return (
    <li ref={ref}>
      <label htmlFor={`candidateRankInput--${candidate.id}`}>
        Candidate rank
        <br/>
        <strong>
          {candidate.name}
        </strong>
      </label>
      <input
        id={`candidateRankInput--${candidate.id}`}
        inputMode="numeric"
        max={max}
        min={min}
        onChange={onChange}
        onKeyDown={onKeyDownCandidateRank}
        onKeyUp={onKeyUpCandidateRank}
        pattern="[0-9]*"
        placeholder={candidateRankInputValue || value}
        step="1"
        type="number"
        value={candidateRankInputValue}
      />
    <button
      onClick={onClickCandidateRankUp}
      type="button"
    >
      ↑
    </button>
    <button
      onClick={onClickCandidateRankDown}
      type="button"
    >
      ↓
    </button>
  </li>
  );
});

const DraggableCandidate = ({
  className,
  onHoverCandidate,
  index,
  onMoveCandidate,
  style,
  ...passedProps
}) => {
  const ref = useRef(null)

  const { candidate } = passedProps;

  const [, drop] = useDrop({
    accept: ItemTypes.CANDIDATE,
    drop(item, monitor) {
      const dragIndex = item.index;
      const dropIndex = index;

      if (dragIndex === dropIndex) {
        return;
      }

      onMoveCandidate(dragIndex, dropIndex);
    },
  });

  const [{ isDragging }, drag] = useDrag({
    item: { type: ItemTypes.CANDIDATE, id: candidate.id, index },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <Candidate
      ref={ref}
      {...passedProps}
    />
  );
};

export default DraggableCandidate;
