import styled from "styled-components";
import { Theme } from "../styles";

const Error = ({ statusCode }) => {
  return (
    <Container>
      {statusCode && <ErrorCode>{statusCode}</ErrorCode>}
      <ErrorText>
        {statusCode && statusCode === 404
          ? "Hakemaasi sivua ei löydy"
          : "Sivulla tapahtui virhe"}
      </ErrorText>
    </Container>
  );
};

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

const Container: any = styled.div`
  color: ${Theme.color.secondary};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 5px;
`;

const ErrorCode: any = styled.p`
  color: ${Theme.color.primaryLight};
  font-family: ${Theme.font.primary};
  letter-spacing: 0.03rem;
  line-height: 3rem;
  font-size: 3.68rem;
  margin: 14px 0 0 -4px;
  font-weight: 700;
`;

const ErrorText: any = styled.p`
  color: ${Theme.color.primary};
  font-family: ${Theme.font.primary};
  font-size: 1rem;
`;

export default Error;
