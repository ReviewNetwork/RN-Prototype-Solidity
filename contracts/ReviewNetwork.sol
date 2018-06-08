pragma solidity ^0.4.19;
pragma experimental ABIEncoderV2;

import "./REWToken.sol";

contract ReviewNetwork {
    REWToken token;

    enum SurveyStatus { IDLE, FUNDED, IN_PROGRESS, COMPLETED }

    struct Answer {
        string answersJsonHash;
    }

    struct Survey {
        address creator;
        string title;
        string surveyJsonHash;
        uint rewardPerSurvey;
        uint funds;
        SurveyStatus status;
        mapping (address => Answer) answers;
    }

    // surveyJsonHash => survey
    mapping (string => Survey) surveys;

    event SurveyAdded(
        address creator,
        string title,
        string surveyJsonHash,
        uint rewardPerSurvey
    );
    
    event SurveyFunded(
        address creator,
        string title,
        string surveyJsonHash,
        uint rewardPerSurvey
    );
    
    event SurveyStarted(
        address creator,
        string title,
        string surveyJsonHash,
        uint rewardPerSurvey
    );

    event SurveyCompleted(
        address creator,
        string title,
        string surveyJsonHash,
        uint rewardPerSurvey
    );

    event SurveyAnswered(
        address user,
        string title,
        uint rewardPerSurvey
    );

    function ReviewNetwork(address REWTokenAddress) public {
        token = REWToken(REWTokenAddress);
    }

    function createSurvey(string title, string surveyJsonHash, uint rewardPerSurvey) public {
        Survey memory s = Survey(
            msg.sender,
            title,
            surveyJsonHash,
            rewardPerSurvey,
            0,
            SurveyStatus.IDLE
        );

        surveys[surveyJsonHash] = s;

        SurveyAdded(
            msg.sender,
            title,
            surveyJsonHash,
            rewardPerSurvey
        );
    }

    function fundSurvey(string surveyJsonHash, uint amount) public {
        Survey memory survey = surveys[surveyJsonHash];

        require(msg.sender == survey.creator);

        uint allowance = token.allowance(msg.sender, this);
        require(allowance >= amount);

        require(token.transferFrom(msg.sender, this, amount));
        surveys[surveyJsonHash].funds += amount;
        surveys[surveyJsonHash].status = SurveyStatus.FUNDED;

        SurveyFunded(
            msg.sender,
            survey.title,
            survey.surveyJsonHash,
            survey.rewardPerSurvey
        );
    }

    function startSurvey(string surveyJsonHash) public {
        Survey memory survey = surveys[surveyJsonHash];
        require(msg.sender == survey.creator);
        require(survey.status == SurveyStatus.FUNDED);

        surveys[surveyJsonHash].status = SurveyStatus.IN_PROGRESS;

        SurveyStarted(
            msg.sender,
            survey.title,
            survey.surveyJsonHash,
            survey.rewardPerSurvey
        );
    }

    function completeSurvey(string surveyJsonHash) public {
        Survey memory survey = surveys[surveyJsonHash];
        require(msg.sender == survey.creator);
        require(survey.status == SurveyStatus.IN_PROGRESS);

        surveys[surveyJsonHash].status = SurveyStatus.COMPLETED;

        SurveyCompleted(
            msg.sender,
            survey.title,
            survey.surveyJsonHash,
            survey.rewardPerSurvey
        );
    }

    function getSurveyFunds(string surveyJsonHash) public view returns (uint) {
        return surveys[surveyJsonHash].funds;
    }

    function getSurveyStatus(string surveyJsonHash) public view returns (SurveyStatus) {
        return surveys[surveyJsonHash].status;
    }

    function answerSurvey(string surveyJsonHash, string answersJsonHash) public {
        Survey memory survey = surveys[surveyJsonHash];
        require(keccak256(answersJsonHash) != keccak256(""));
        require(keccak256(surveyJsonHash) != keccak256(""));
        require(survey.status == SurveyStatus.IN_PROGRESS);
        // require(keccak256(surveys[surveyJsonHash].answers[msg.sender].answersJsonHash) == keccak256(""));
        require(survey.funds >= survey.rewardPerSurvey);
        surveys[surveyJsonHash].answers[msg.sender] = Answer(answersJsonHash);
        require(token.transfer(msg.sender, survey.rewardPerSurvey));
        surveys[surveyJsonHash].funds -= surveys[surveyJsonHash].rewardPerSurvey;
        SurveyAnswered(msg.sender, survey.title, survey.rewardPerSurvey);
    }

    function isSurveyAnsweredBy(string surveyJsonHash, address user) public view returns (bool) {
        return keccak256(surveys[surveyJsonHash].answers[user].answersJsonHash) == keccak256("");
    }
}
