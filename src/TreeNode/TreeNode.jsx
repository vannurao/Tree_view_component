import { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { fetchChildren } from '../TreeData/TreeData';

export default function TreeNode({ node, index, parentId, onUpdate, onAdd, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(node.name);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: node.id,
    data: {
      type: 'item',
      node,
      index,
      parentId,
    },
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: node.id,
    data: {
      type: 'parent',
      node,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const toggleExpand = async () => {
    if (!expanded && node.children === null) {
      setLoading(true);
      const children = await fetchChildren(node.id);
      onUpdate({ ...node, children });
      setLoading(false);
    }
    setExpanded(!expanded);
  };

  const handleAdd = () => {
    const childName = prompt('Enter node name:');
    if (!childName) return;

    const newChild = {
      id: Date.now().toString(),
      name: childName,
      hasChildren: false,
      children: [],
      nodeName: childName.charAt(0).toUpperCase(),
      backgroundColor: '#' + Math.floor(Math.random() * 16777215).toString(16),
    };

    onAdd(node.id, newChild);
    setExpanded(true);
  };

  const handleDelete = () => {
    if (window.confirm('Delete this node and its children?')) {
      onDelete(node.id);
    }
  };

  const handleEdit = () => {
    onUpdate({ ...node, name });
    setEditing(false);
  };

  useEffect(() => {
    if (!node?.id) return;
    if (node.id === 'A') {
      setExpanded(true);
    }
  }, [node.id]);

  return (
    <div style={{ margin: '10px 40px' }} ref={setNodeRef}>
      <div
        ref={setDroppableRef}
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          border: isOver ? '2px solid #4CAF50' : '1px solid #cccccc',
          boxShadow: '0px 4px 4px rgba(0,0,0,0.1)',
          width: '16%',
          borderRadius: '12px',
          gap: '8px',
          padding: '6px',
          backgroundColor: isOver ? '#f0f9ff' : 'white',
        }}
        {...attributes}
        {...listeners}
      >
        <span
            style={{ cursor: 'pointer', fontWeight: 'bold' }}
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand();
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {expanded ? (
              <img
                src="./arrow.png"
                height={'16px'}
                width={'16px'}
                style={{ rotate: '90deg' }}
                alt="collapse"
              />
            ) : (
              <img src="./arrow.png" height={'16px'} width={'16px'} alt="expand" />
            )}
          </span>

        <div
          style={{
            width: '30px',
            height: '30px',
            backgroundColor: node.backgroundColor,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: '550',
            cursor:'pointer'
          }}
        >
          {node.nodeName}
        </div>

        {editing ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleEdit}
            autoFocus
            style={{ width: '100px' }}
            onPointerDown={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
          >{`${node.name}`}</span>
        )}

        <div
          onClick={(e) => {
            e.stopPropagation();
            handleAdd();
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <img
            src="./plus-icon.png"
            width={'22px'}
            height={'22px'}
            style={{ cursor: 'pointer' }}
            alt="add"
          />
        </div>
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <img
            src="./delete.png"
            width={'22px'}
            height={'22px'}
            style={{ cursor: 'pointer' }}
            alt="delete"
          />
        </div>
      </div>

      {loading && <div style={{ marginLeft: '20px' }}>Loading...</div>}

      {expanded && node.children && (
        <SortableContext
          items={node.children.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {node.children.map((child, childIndex) => (
            <TreeNode
              key={child.id}
              node={child}
              index={childIndex}
              parentId={node.id}
              onUpdate={onUpdate}
              onAdd={onAdd}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
      )}
    </div>
  );
}