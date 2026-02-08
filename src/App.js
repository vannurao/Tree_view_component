import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TreeNode from './TreeNode/TreeNode';
import { initialTree } from './TreeData/TreeData';

function TreeView() {
  const [tree, setTree] = useState(initialTree);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const updateNode = (updatedNode) => {
    const updateRecursive = (nodes) =>
      nodes.map((node) => {
        if (node.id === updatedNode.id) return updatedNode;
        if (node.children)
          return { ...node, children: updateRecursive(node.children) };
        return node;
      });

    setTree(updateRecursive(tree));
  };

  const addChild = (parentId, child) => {
    const addRecursive = (nodes) =>
      nodes.map((node) => {
        if (node.id === parentId) {
          return {
            ...node,
            children: node.children ? [...node.children, child] : [child],
          };
        }
        if (node.children)
          return { ...node, children: addRecursive(node.children) };
        return node;
      });

    setTree(addRecursive(tree));
  };

  const deleteNode = (nodeId) => {
    const deleteRecursive = (nodes) =>
      nodes
        .filter((n) => n.id !== nodeId)
        .map((node) =>
          node.children
            ? { ...node, children: deleteRecursive(node.children) }
            : node
        );

    setTree(deleteRecursive(tree));
  };

  const findNode = (nodes, id) => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNode(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const removeNode = (nodes, id) => {
    let removedNode = null;
    const newNodes = nodes.filter((node) => {
      if (node.id === id) {
        removedNode = node;
        return false;
      }
      return true;
    }).map((node) => {
      if (node.children) {
        const result = removeNode(node.children, id);
        if (result.removed) removedNode = result.removed;
        return { ...node, children: result.nodes };
      }
      return node;
    });
    
    return { nodes: newNodes, removed: removedNode };
  };

  const insertNode = (nodes, parentId, nodeToInsert, index) => {
    if (parentId === null) {
      const newNodes = [...nodes];
      newNodes.splice(index, 0, nodeToInsert);
      return newNodes;
    }

    return nodes.map((node) => {
      if (node.id === parentId) {
        const children = node.children || [];
        const newChildren = [...children];
        newChildren.splice(index, 0, nodeToInsert);
        return { ...node, children: newChildren };
      }
      if (node.children) {
        return { ...node, children: insertNode(node.children, parentId, nodeToInsert, index) };
      }
      return node;
    });
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeNode = findNode(tree, active.id);
    if (!activeNode) return;

    const isDescendant = (parentNode, childId) => {
      if (parentNode.id === childId) return true;
      if (parentNode.children) {
        return parentNode.children.some(child => isDescendant(child, childId));
      }
      return false;
    };

    if (isDescendant(activeNode, over.id)) {
      return;
    }

    const { nodes: newTree, removed } = removeNode(tree, active.id);

    const overData = over.data.current;
    
    if (overData?.type === 'parent') {
      const updatedTree = insertNode(newTree, over.id, removed, Number.MAX_SAFE_INTEGER);
      setTree(updatedTree);
    } else if (overData?.type === 'item') {
      const parentId = overData.parentId;
      const overIndex = overData.index;
      
      const updatedTree = insertNode(newTree, parentId, removed, overIndex);
      setTree(updatedTree);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeNode = activeId ? findNode(tree, activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="App" style={{ backgroundColor: '#f8f8f8', padding: '20px 0px' }}>
        <SortableContext items={tree.map(n => n.id)} strategy={verticalListSortingStrategy}>
          {tree.map((node, index) => (
            <TreeNode
              key={node.id}
              node={node}
              index={index}
              parentId={null}
              onUpdate={updateNode}
              onAdd={addChild}
              onDelete={deleteNode}
            />
          ))}
        </SortableContext>
      </div>
      
      <DragOverlay>
        {activeNode ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #cccccc',
              boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
              width: '16%',
              borderRadius: '12px',
              gap: '8px',
              padding: '6px',
              backgroundColor: 'white',
              opacity: 0.8,
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                backgroundColor: activeNode.backgroundColor,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: '550',
              }}
            >
              {activeNode.nodeName}
            </div>
            <span>{activeNode.name}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default TreeView;