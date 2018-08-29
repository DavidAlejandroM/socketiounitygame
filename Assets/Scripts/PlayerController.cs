
using UnityEngine;

public class PlayerController : MonoBehaviour {

    public GameObject bulletPrefab;
    public Transform bulletSpawn;
    public bool isLocalPlayer = false;
    public bool isGrounded = true;
    public float speed = 3.0f;
    public float rotationSpeed = 450.0f;
    public Vector3 speedJump = new Vector3(0, 10, 0);


    Vector3 oldPosition;
    Vector3 currentPosition;
    Quaternion oldRotation;
    Quaternion currentRotation;

    private void Start()
    {
        oldPosition = transform.position;
        currentPosition = oldPosition;
        oldRotation = transform.rotation;

        currentRotation = oldRotation;
    }

    // Update is called once per frame
    void Update () {

        if (!isLocalPlayer){
            //print("No es local player");
            return;
        }

        var x = Input.GetAxis("Horizontal") * Time.deltaTime * speed;
        var z = Input.GetAxis("Vertical") * Time.deltaTime * speed;
        var rx = Input.GetAxis("Mouse X") * Time.deltaTime * rotationSpeed;

        //print(x);

        Rotate(new Vector3(0, rx, 0));
        Move(new Vector3(x, 0, z));


        currentPosition = transform.position;
        currentRotation = transform.rotation;

        if(currentPosition != oldPosition) {
            NetworkManager.instance.GetComponent<NetworkManager>().CommandMove(transform.position); 
            oldPosition = currentPosition;
        }

        if(currentRotation != oldRotation) {
            NetworkManager.instance.GetComponent<NetworkManager>().CommandTurn(transform.rotation);
            oldRotation = currentRotation;
        }

        if (Input.GetKeyDown(KeyCode.Space)){
            GetComponent<Rigidbody>().velocity = speedJump;
        }



        if(Input.GetMouseButtonDown(0))
        {
            NetworkManager n = NetworkManager.instance.GetComponent<NetworkManager>();
            n.CommandShoot();
            //CmdFire();
        }

    }

    public void CmdFire()
    {
        var bullet = Instantiate(bulletPrefab,
                                    bulletSpawn.position,
                                    bulletSpawn.rotation) as GameObject;

        Bullet b = bullet.GetComponent<Bullet>();
        b.playerFrom = this.gameObject;
        bullet.GetComponent<Rigidbody>().velocity = bullet.transform.up * 6;

        Destroy(bullet, 2.0f);
    }

    public void Move(Vector3 vec)
    {
        transform.Translate(vec);
    }

    public void Rotate(Vector3 vec)
    {
        transform.Rotate(vec);
    }
}
    