import {
  Button,
  DynamicTable,
  Link,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
  Text,
  Tooltip,
} from "@forge/react";
import React from "react";
import { PullRequestStatus } from "./pull-request-status";
import TimeStampFormatter from "./date-formatter";
import Avatar from "./avatar";
import PullRequestReviewers from "./pull-request-reviewers";

export const head = {
  cells: [
    {
      key: "id",
      content: "ID",
      isSortable: true,
    },
    {
      key: "repository",
      content: "Repository",
      isSortable: true,
    },
    {
      key: "title",
      content: "Title",
      isSortable: true,
    },
    {
      key: "status",
      content: "Status",
    },
    {
      key: "author",
      content: "Author",
    },
    {
      key: "reviewer",
      content: "Reviewer",
    },
    {
      key: "updated",
      content: "Updated",
    },
  ],
};

export const PullRequestsModal = ({ prs, modalIsOpen, closeModal }) => {
  const rows = prs.map((pr, index) => ({
    key: `row-${index}-${pr.id}`,
    cells: [
      {
        key: "id",
        content: (
          <Link href={pr.link} openNewTab>
            <Text size="small">{pr.id}</Text>
          </Link>
        ),
      },
      {
        key: "repository",
        content: <Text size="small">{pr.repository.full_name}</Text>,
      },
      {
        key: "title",
        content: (
          <Link href={pr.link} openNewTab>
            {pr.title}
          </Link>
        ),
      },
      {
        key: "status",
        content: <PullRequestStatus pr={pr} />,
      },
      {
        key: "author",
        content: (
          <Tooltip content={pr.user.login}>
            <Avatar src={pr.user.avatar_url} />
          </Tooltip>
        ),
      },
      {
        key: "reviewer",
        content: <PullRequestReviewers pr={pr} />,
      },
      {
        key: "updated",
        content: (
          <Text>{TimeStampFormatter.formatTimestamp(pr.updatedAt)}</Text>
        ),
      },
    ],
  }));
  return (
    <ModalTransition>
      {modalIsOpen && (
        <Modal onClose={closeModal} width="x-large">
          <ModalHeader>
            <ModalTitle>{prs.length} Pull requests</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <DynamicTable head={head} rows={rows} />
          </ModalBody>
          <ModalFooter>
            <Button appearance="subtle" onClick={closeModal}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </ModalTransition>
  );
};

export default PullRequestsModal;
