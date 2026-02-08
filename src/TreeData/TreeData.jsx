export const initialTree = [
  {
    id: "A",
    name: "Level A",
    nodeName : "A",
    backgroundColor : 'blue',
    hasChildren: true,
    children: [
      {
        id: "B1",
        name: "Level A",
        nodeName : "B",
        backgroundColor : 'green',
        hasChildren: true,
        children: [
          {
            id: "C1",
            name: "Level A",
            nodeName : "C",
            backgroundColor : 'green',
            hasChildren: true,
            children: [
              {
                id: "D1",
                name: "Level A",
                nodeName : "D",
                backgroundColor : 'green',
                hasChildren: false,
                children: []
              }
            ]
          },

          {
            id: "C2",
            name: "Level A",
            nodeName : "C",
            backgroundColor : 'green',
            hasChildren: false,
            children: []
          },

          {
            id: "C3",
            name: "Level A",
            nodeName : "C",
            backgroundColor : 'green',
            hasChildren: false,
            children: []
          }
        ]
      },
      {
        id: "B2",
        name: "Level A",
        nodeName : "B",
        backgroundColor : 'green',
        hasChildren: false,
        children: []
      }
    ]
  },
];

export const fetchChildren = (parentId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let children = [];

      if (parentId === "A") {
        children = [
          {
            id: "B1",
            name: "Level B",
            nodeName: 'B',
            backgroundColor : 'green',
            hasChildren: true,
            children: null, 
          },
          {
            id: "B2",
            name: "Level B",
            nodeName: 'B',
            backgroundColor : 'green',
            hasChildren: true,
            children: null, 
          }
        ];
      }

      if (parentId === "B1") {
        children = [
          {
            id: "C1",
            name: "Level A",
            nodeName: "C",
            backgroundColor : 'green',
            hasChildren: true,
            children: null,
          },
          {
            id: "C2",
            name: "Level A",
            nodeName: "C",
            backgroundColor : 'green',
            hasChildren: false,
            children: [],
          },
          {
            id: "C3",
            name: "Level A",
            nodeName: "C",
            backgroundColor : 'green',
            hasChildren: false,
            children: [],
          }
        ];
      }

      if (parentId === "C1") {
        children = [
          {
            id: "D1",
            name: "Level A",
            nodeName: "D",
            backgroundColor : 'green',
            hasChildren: false,
            children: [],
          }
        ];
      }

      resolve(children);
    }, 800); 
  });
};
