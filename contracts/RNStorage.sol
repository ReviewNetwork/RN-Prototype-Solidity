pragma solidity ^0.4.24;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./REWToken.sol";

contract RNStorage {
    /**
     * Enums
     */

    enum SurveyStatus { IDLE, FUNDED, IN_PROGRESS, COMPLETED }
    enum ReviewStatus { PENDING, APPROVED, REJECTED }

    /**
     * Structs
     */

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
        uint currentAnswers;
        uint maxAnswers;
        SurveyStatus status;
        bool suspended;
        mapping (address => Answer) answers;
    }

    struct Product {
        address productAddress;
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
     * Constants
     */

    uint constant NUMBER_OF_VALIDATORS = 3;

    /**
     * Variables
     */

    REWToken token;

    /* key: string - Survey JSON IPFS hash */
    mapping (string => Survey) surveys;
    mapping (address => Product) products;
    mapping (address => User) users;
    mapping (address => Review) reviews;
    address[] validators;
}
