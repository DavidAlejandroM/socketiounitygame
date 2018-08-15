using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class Health : MonoBehaviour {

    public const int maxHealth = 100;
    public bool destroyOnDeath;

    public int currentHealth = maxHealth;
    public bool isEnemy = false;

    //public RectTransform healthBar;
    public Slider sHealthBar;

    private bool isLocalPlayer = false;

	// Use this for initialization
	void Start () {
        PlayerController pc = GetComponent<PlayerController>();
        isLocalPlayer = pc.isLocalPlayer;
	}

    public void TakeDamage(GameObject playerFrom, int amount)
    {
        currentHealth -= amount;
        //print("la salud está en :" + currentHealth);
        OnChangeHealth();
        //TODO network
    }

    public void OnChangeHealth()
    {
        //healthBar.sizeDelta = new Vector2(currentHealth, healthBar.sizeDelta.y);
        sHealthBar.value = (currentHealth+0.0f) / (maxHealth+0.0f);

        if(currentHealth <= 0)
        {
            if (destroyOnDeath)
            {
                Destroy(gameObject);
            }
        }
    }

    void Respawn()
    {
        if (isLocalPlayer)
        {
            Vector3 spawnPoint = Vector3.zero;
            Quaternion spawnRotation = Quaternion.Euler(0, 100, 0);
            transform.position = spawnPoint;
            transform.rotation = spawnRotation;
        }
    }

}
