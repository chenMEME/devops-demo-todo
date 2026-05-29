name: Feature Request
description: 新功能需求
labels: [enhancement]
body:
  - type: textarea
    attributes:
      label: User Story
      description: 作为一个用户，我想要...
    validations:
      required: true
  - type: textarea
    attributes:
      label: 验收标准
      description: 1. 2. 3.
  - type: dropdown
    attributes:
      label: 优先级
      options: [P0-紧急, P1-高, P2-中, P3-低]
