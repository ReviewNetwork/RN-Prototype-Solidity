pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "./REWToken.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract ReviewNetwork is Ownable {
    REWToken token;
    uint constant NUMBER_OF_VALIDATORS = 3;

    enum SurveyStatus { IDLE, FUNDED, IN_PROGRESS, COMPLETED }
    enum ReviewStatus { PENDING, APPROVED, REJECTED }

    struct User {
        string username;
    }

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

    struct Product {
        address addedBy;
        uint categoryId;
        uint subcategoryId;
        string name;
        string image;
        string description;
        string metaJsonHash;
    }

    struct Review {
        User author;
        Product product;
        uint score;
        uint upvotes;
        uint downvotes;
        string metaJsonHash;
        ReviewStatus status;
        address[] chosenValidators;
        mapping (address => int) validationVotes;
        mapping (address => bool) userVotes;
    }

    /**
     * key: string - Survey JSON IPFS hash
     */
    mapping (string => Survey) surveys;
    mapping (address => Product) products;
    mapping (address => User) users;
    mapping (address => Review) reviews;
    address[] validators;

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

    event LogProductAdded(
        address productAddress,
        uint indexed categoryId,
        uint indexed subcategoryId,
        string name,
        string image,
        string description,
        string metaHashJson
    );

    event LogReviewAdded(
        address reviewAddress,
        address indexed authorAddress,
        address indexed productAddress,
        string metaJsonHash
    );

    event LogValidatorAdded(
        address validatorAddress
    );

    event LogValidatorChosen(
        address indexed reviewAddress,
        address indexed validatorAddress
    );

    event LogReviewApproved(
        address indexed reviewAddress
    );

    event LogReviewRejected(
        address indexed reviewAddress
    );

    constructor (address REWTokenAddress) public {
        token = REWToken(REWTokenAddress);
    }

    function createSurvey(
        string publicKey,
        string title,
        string surveyJsonHash,
        uint rewardPerSurvey,
        uint maxAnswers
    ) public {
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

        surveys[surveyJsonHash].answers[msg.sender] = Answer(answersJsonHash);
        require(token.transfer(msg.sender, survey.rewardPerSurvey));
        surveys[surveyJsonHash].funds -= surveys[surveyJsonHash].rewardPerSurvey;
        emit LogSurveyAnswered(msg.sender, surveyJsonHash, answersJsonHash, survey.title, survey.rewardPerSurvey);

        if (surveys[surveyJsonHash].funds < survey.rewardPerSurvey) {
            surveys[surveyJsonHash].status = SurveyStatus.COMPLETED;
            emit LogSurveyCompleted(
                survey.creator,
                survey.publicKey,
                survey.title,
                survey.surveyJsonHash,
                survey.rewardPerSurvey,
                survey.maxAnswers
            );
        }
    }

    function isSurveyAnsweredBy(string surveyJsonHash, address user) public view returns (bool) {
        return keccak256(bytes(surveys[surveyJsonHash].answers[user].answersJsonHash)) != keccak256("");
    }

    function createProduct (
        address productAddress,
        uint categoryId,
        uint subcategoryId,
        string name,
        string image,
        string description,
        string metaJsonHash
    ) public onlyOwner {
        Product memory product = Product({
            addedBy: msg.sender,
            categoryId: categoryId,
            subcategoryId: subcategoryId,
            name: name,
            image: image,
            description: description,
            metaJsonHash: metaJsonHash
        });

        products[productAddress] = product;

        emit LogProductAdded(productAddress, categoryId, subcategoryId, name, image, description, metaJsonHash);
    }

    function registerUser (string username) public {
        require(keccak256(username) != keccak256(""), "Username can't be empty");
        User memory user = User({ username: username });
        users[msg.sender] = user;
    }

    function getUsername (address user) public view returns (string) {
        return users[user].username;
    }

    function userExists (address userAddress) public view returns (bool) {
        return keccak256(users[userAddress].username) != keccak256("");
    }

    function createReview (
        address reviewAddress,
        address productAddress,
        uint score,
        string metaJsonHash
    ) public {
        require(score >= 1 && score <= 4, "Score must be between 1 and 4");

        User memory author = users[msg.sender];
        require(keccak256(author.username) != keccak256(""), "You are not registered as a user. Please register first!");

        Product memory product = products[productAddress];

        Review memory review = Review({
            author: author,
            product: product,
            score: score,
            upvotes: 0,
            downvotes: 0,
            metaJsonHash: metaJsonHash,
            status: ReviewStatus.PENDING,
            chosenValidators: choseValidators(msg.sender)
        });

        reviews[reviewAddress] = review;

        for (uint index = 0; index < review.chosenValidators.length; index++) {
            emit LogValidatorChosen(reviewAddress, review.chosenValidators[index]);
        }

        emit LogReviewAdded(reviewAddress, msg.sender, productAddress, metaJsonHash);
    }

    function voteReview (address reviewAddress, int vote) public {
        require(vote == 1 || vote == -1, "Vote must be either 1 or -1.");
        require(reviews[reviewAddress].userVotes[msg.sender] == false, "You already voted on this review.");

        reviews[reviewAddress].userVotes[msg.sender] = true;

        if (vote == 1) {
            reviews[reviewAddress].upvotes += 1;
        } else if (vote == -1) {
            reviews[reviewAddress].downvotes += 1;
        }
    }

    function getReviewVotes (address reviewAddress) public view returns (uint upvotes, uint downvotes) {
        return (reviews[reviewAddress].upvotes, reviews[reviewAddress].downvotes);
    }

    function getReviewStatus(address reviewAddress) public view returns (ReviewStatus) {
        return reviews[reviewAddress].status;
    }

    function isValidatorChosenForReview (address reviewAddress, address validator) public view returns (bool) {
        Review memory review = reviews[reviewAddress];
        
        bool isValidatorChosen = false;
        for (uint index = 0; index < review.chosenValidators.length; index++) {
            if (review.chosenValidators[index] == validator) {
                isValidatorChosen = true;
            }
        }

        return isValidatorChosen;
    }

    function validatorVote(address reviewAddress, int vote) public {
        Review storage review = reviews[reviewAddress];

        require(review.status == ReviewStatus.PENDING, "Review already validated.");
        require(reviews[reviewAddress].validationVotes[msg.sender] == 0, "You already voted on this review.");
        require(isValidatorChosenForReview(reviewAddress, msg.sender), "You are not chosen to validate this review.");
        require(vote == -1 || vote == 1, "Vote must be -1 or 1.");

        reviews[reviewAddress].validationVotes[msg.sender] = vote;

        bool everyoneVoted = true;
        int tally = 0;

        for (uint index = 0; index < NUMBER_OF_VALIDATORS; index++) {
            tally += review.validationVotes[review.chosenValidators[index]];

            if (review.validationVotes[review.chosenValidators[index]] == 0) {
                everyoneVoted = false;
            }
        }

        if (everyoneVoted) {
            if (tally > 0) {
                reviews[reviewAddress].status = ReviewStatus.APPROVED;
                emit LogReviewApproved(reviewAddress);
            } else {
                reviews[reviewAddress].status = ReviewStatus.REJECTED;
                emit LogReviewRejected(reviewAddress);
            }
        }
    }

    function addValidator(address validatorAddress) public onlyOwner {
        bool validatorExists = false;
        for(uint i = 0; i < validators.length; i++) {
            if (validatorAddress == validators[i]) {
                validatorExists = true;
            }
        }
        
        require(!validatorExists, "Validator already exists");
        validators.push(validatorAddress);

        emit LogValidatorAdded(validatorAddress);
    }

    function choseValidators(address author) public view returns (address[]) {
        require(validators.length >= NUMBER_OF_VALIDATORS, "Not enough validators in the system!");

        uint a = uint256(author);
        bytes32 b = bytes32(block.timestamp);
        uint r = uint(keccak256(abi.encodePacked(a, b)));
        uint point = r % validators.length;

        address[] memory chosenOnes = new address[](NUMBER_OF_VALIDATORS);

        uint counter = 0;
        uint index = 1;

        while(counter < NUMBER_OF_VALIDATORS) {
            address chosenValidator = validators[(point + index) % validators.length];

            bool alreadyPicked = false;
            for(uint i = 0; i < chosenOnes.length; i++) {
                if (chosenOnes[i] == chosenValidator) {
                    alreadyPicked = true;
                } 
            }

            if (!alreadyPicked) {
                chosenOnes[counter] = chosenValidator;
                counter++;
            }

            index++;

        }

        return chosenOnes;
    }
}
