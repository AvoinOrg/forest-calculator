import styled from "styled-components";
import Link from "next/link";

import { Theme } from "../styles";

interface Props {
  text: string;
  id: string;
}

const NotFound = (props: Props) => {
  return (
    <ErrorContainer>
      <ErrorText>
        {props.text} "{props.id}" ei löydy.
      </ErrorText>
      <Link href="/">
        <ErrorLink>
          <u>Takaisin hakuun.</u>
        </ErrorLink>
      </Link>
    </ErrorContainer>
  );
};

const ErrorContainer: any = styled.div`
  color: ${Theme.color.secondary};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 5px;
`;

const ErrorText: any = styled.p`
  color: ${Theme.color.primary};
  font-family: ${Theme.font.primary};
  font-size: 1.5rem;
`;

const ErrorLink: any = styled.p`
  color: ${Theme.color.primary};
  font-family: ${Theme.font.primary};
  font-size: 1.2rem;
  margin: 40px 0 0 0;
  &:hover {
    cursor: pointer;
  }
`;

export default NotFound;
