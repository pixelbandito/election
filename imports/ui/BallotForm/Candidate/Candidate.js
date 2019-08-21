import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd'

const ItemTypes = {
  CANDIDATE: 'candidate',
};

export const Candidate = React.forwardRef(({
  candidate,
  max,
  min,
  onChangeCandidateRankInput,
  onKeyDownCandidateRank,
  onKeyUpCandidateRank,
  value,
}, ref) => (
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
      max={max}
      min={min}
      onChange={onChangeCandidateRankInput}
      onKeyDown={onKeyDownCandidateRank}
      onKeyUp={onKeyUpCandidateRank}
      step="1"
      type="number"
      value={value}
    />
</li>
));

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
