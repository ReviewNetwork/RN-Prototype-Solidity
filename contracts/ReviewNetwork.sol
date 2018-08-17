pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "./REWToken.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract ReviewNetwork is Ownable {
    REWToken token;

    enum SurveyStatus { IDLE, FUNDED, IN_PROGRESS, COMPLETED }

    struct Answer {
        string answersJsonHash;
    }

    struct Survey {
        address creator;
        string publicKey;
        string title;
        string surveyJsonHash;
        uint rewardPerSurvey;
        uint funds;
        uint maxAnswers;
        SurveyStatus status;
        mapping (address => Answer) answers;
    }

    // surveyJsonHash => survey
    mapping (string => Survey) surveys;

    struct Brand {
        address addedBy;
        string name;
        string logo;
        string metaJsonHash;
    }

    mapping (address => Brand) brands;
    
    struct Product {
        address addedBy;
        Brand brand;
        string name;
        string image;
        string metaJsonHash;
    }

    mapping (address => Product) products;

    struct User {
        string username;
    }

    mapping (address => User) users;

    struct Review {
        User author;
        Product product;
        uint score;
        string metaJsonHash;
    }

    mapping (address => Review) reviews;

    event LogSurveyAdded(
        address indexed creator,
        string publicKey,
        string title,
        string surveyJsonHash,
        uint rewardPerSurvey,
        uint maxAnswers
    );
    
    event LogSurveyFunded(
        address indexed creator,
        string publicKey,
        string title,
        string surveyJsonHash,
        uint rewardPerSurvey,
        uint maxAnswers
    );
    
    event LogSurveyStarted(
        address indexed creator,
        string publicKey,
        string title,
        string surveyJsonHash,
        uint rewardPerSurvey,
        uint maxAnswers
    );

    event LogSurveyCompleted(
        address indexed creator,
        string publicKey,
        string title,
        string surveyJsonHash,
        uint rewardPerSurvey,
        uint maxAnswers
    );

    event LogSurveyAnswered(
        address indexed user,
        string surveyJsonHash,
        string answersJsonHash,
        string title,
        uint rewardPerSurvey
    );

    event LogBrandAdded(
        address indexed brandAddress,
        string name,
        string logo,
        string metaHashJson
    );

    event LogProductAdded(
        address indexed productAddress,
        address indexed brandAddress,
        string name,
        string image,
        string metaHashJson
    );

    event LogReviewAdded(
        address reviewAddress,
        address indexed authorAddress,
        address indexed productAddress
    );

    constructor (address REWTokenAddress) public {
        token = REWToken(REWTokenAddress);
    }

    function createSurvey(string publicKey, string title, string surveyJsonHash, uint rewardPerSurvey, uint maxAnswers) public {
        Survey memory s = Survey(
            msg.sender,
            publicKey,
            title,
            surveyJsonHash,
            rewardPerSurvey,
            0,
            maxAnswers,
            SurveyStatus.IDLE
        );

        surveys[surveyJsonHash] = s;

        emit LogSurveyAdded(
            msg.sender,
            s.publicKey,
            title,
            surveyJsonHash,
            rewardPerSurvey,
            maxAnswers
        );
    }

    function fundSurvey(string surveyJsonHash, uint amount) public {
        Survey memory survey = surveys[surveyJsonHash];

        require(msg.sender == survey.creator);

        uint allowance = token.allowance(msg.sender, this);
        require(allowance >= amount);

        require(token.transferFrom(msg.sender, this, amount));
        surveys[surveyJsonHash].funds += amount;
        
        if(survey.status == SurveyStatus.IDLE) {
            surveys[surveyJsonHash].status = SurveyStatus.FUNDED;
        }

        emit LogSurveyFunded(
            msg.sender,
            survey.publicKey,
            survey.title,
            survey.surveyJsonHash,
            survey.rewardPerSurvey,
            survey.maxAnswers
        );
    }

    function startSurvey(string surveyJsonHash) public {
        Survey memory survey = surveys[surveyJsonHash];
        require(msg.sender == survey.creator);
        require(survey.status == SurveyStatus.FUNDED);

        surveys[surveyJsonHash].status = SurveyStatus.IN_PROGRESS;

        emit LogSurveyStarted(
            msg.sender,
            survey.publicKey,
            survey.title,
            survey.surveyJsonHash,
            survey.rewardPerSurvey,
            survey.maxAnswers
        );
    }

    function completeSurvey(string surveyJsonHash) public {
        Survey memory survey = surveys[surveyJsonHash];
        require(msg.sender == survey.creator);
        require(survey.status == SurveyStatus.IN_PROGRESS);

        surveys[surveyJsonHash].status = SurveyStatus.COMPLETED;

        emit LogSurveyCompleted(
            msg.sender,
            survey.publicKey,
            survey.title,
            survey.surveyJsonHash,
            survey.rewardPerSurvey,
            survey.maxAnswers
        );
    }

    function getFunds(string surveyJsonHash) public view returns (uint) {
        return surveys[surveyJsonHash].funds;
    }

    function getSurveyStatus(string surveyJsonHash) public view returns (SurveyStatus) {
        return surveys[surveyJsonHash].status;
    }

    function answerSurvey(string surveyJsonHash, string answersJsonHash) public returns (bool) {
        Survey memory survey = surveys[surveyJsonHash];
        require(keccak256(bytes(answersJsonHash)) != keccak256(""));
        require(keccak256(bytes(surveyJsonHash)) != keccak256(""));
        require(survey.status == SurveyStatus.IN_PROGRESS);
        require(keccak256(surveys[surveyJsonHash].answers[msg.sender].answersJsonHash) == keccak256(""));

        if (survey.funds < survey.rewardPerSurvey) {
            surveys[surveyJsonHash].status = SurveyStatus.COMPLETED;
            emit LogSurveyCompleted(
                survey.creator,
                survey.publicKey,
                survey.title,
                survey.surveyJsonHash,
                survey.rewardPerSurvey,
                survey.maxAnswers
            );

            return false;
        }

        surveys[surveyJsonHash].answers[msg.sender] = Answer(answersJsonHash);
        require(token.transfer(msg.sender, survey.rewardPerSurvey));
        surveys[surveyJsonHash].funds -= surveys[surveyJsonHash].rewardPerSurvey;
        emit LogSurveyAnswered(msg.sender, surveyJsonHash, answersJsonHash, survey.title, survey.rewardPerSurvey);

        return true;
    }

    function isSurveyAnsweredBy(string surveyJsonHash, address user) public view returns (bool) {
        return keccak256(bytes(surveys[surveyJsonHash].answers[user].answersJsonHash)) != keccak256("");
    }

    function createBrand (
        address brandAddress,
        string name,
        string logo,
        string metaJsonHash
    ) public onlyOwner {
        Brand memory brand = Brand({
            addedBy: msg.sender,
            name: name,
            logo: logo,
            metaJsonHash: metaJsonHash
        });

        brands[brandAddress] = brand;

        emit LogBrandAdded(brandAddress, name, logo, metaJsonHash);
    }

    function createProduct (
        address productAddress,
        address brandAddress,
        string name,
        string image,
        string metaJsonHash
    ) public onlyOwner {
        Brand memory brand = brands[brandAddress];

        Product memory product = Product({
            addedBy: msg.sender,
            brand: brand,
            name: name,
            image: image,
            metaJsonHash: metaJsonHash
        });

        products[brandAddress] = product;

        emit LogProductAdded(productAddress, brandAddress, name, image, metaJsonHash);
    }

    function createReview (
        address reviewAddress,
        address authorAddress,
        address productAddress,
        uint score,
        string metaJsonHash
    ) public {
        require(score >= 1 && score <= 4);

        User memory author = users[authorAddress];
        Product memory product = products[productAddress];

        Review memory review = Review({
            author: author,
            product: product,
            score: score,
            metaJsonHash: metaJsonHash
        });

        reviews[reviewAddress] = review;

        emit LogReviewAdded(reviewAddress, authorAddress, productAddress);
    }
}
