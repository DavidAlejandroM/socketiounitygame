using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class MotorPlayer : MonoBehaviour {

    private PlayerController controller;

    private float gravity = 9.0f;
    private float jumpforce = 10.0f;
    private float verticalVelocity;
    // Use this for initialization
    void Start () {
        controller = GetComponent<PlayerController>();
    }
	
	// Update is called once per frame
	void Update () {
        if (controller.isGrounded)
        {
            verticalVelocity = -gravity * Time.deltaTime;
            if (Input.GetKeyDown(KeyCode.Space))
            {
                verticalVelocity = jumpforce;
            }
            else
            {
                verticalVelocity -= gravity * Time.deltaTime; 
            }

            Vector3 moveVector = new Vector3(0, verticalVelocity + 1.0f, 0);
            controller.Move(moveVector * Time.deltaTime);
        }
        else
        {
            print("no está en la tierra");
        }
    }
}
